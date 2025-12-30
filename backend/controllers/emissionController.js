const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Helper: Calculate CO2e
const calculateCO2e = async (category, subcategory, activity_data, input_unit) => {
    try {
        // 1. Find emission factor
        // Simplified logic: selecting the first matching factor. In a real app, match region/unit precise.
        const result = await pool.query(
            'SELECT factor_value, unit FROM emission_factors WHERE category = $1 AND (subcategory = $2 OR $2 IS NULL) LIMIT 1',
            [category, subcategory]
        );

        if (result.rows.length === 0) {
            // Fallback or error. For MVP, return 0 or default per unit.
            return { co2e: 0, factor: 0 };
        }

        const factor = result.rows[0];
        let co2e = 0;

        // 2. Simple Unit Conversion (MVP: assume input unit matches factor unit or basic conversion)
        // Real app needs a conversion library.
        // For this MVP, we assume user inputs in the unit expected by the factor (e.g., kWh, miles, lbs).
        // Or we handle basic ones: 'miles' vs 'km'.

        let standardData = activity_data;
        if (input_unit === 'km' && factor.unit === 'mile') {
            standardData = activity_data * 0.621371;
        } else if (input_unit === 'kg' && factor.unit === 'lb') {
            standardData = activity_data * 2.20462;
        }

        co2e = standardData * parseFloat(factor.factor_value);
        return { co2e, factor: parseFloat(factor.factor_value) };

    } catch (err) {
        console.error("Calculation Error", err);
        return { co2e: 0, factor: 0 };
    }
};

// @desc    Create new emission record (Manual Entry)
// @route   POST /api/emissions
const createEmission = async (req, res) => {
    const { category, subcategory, activity_data, unit, date } = req.body;
    const userId = req.user.id; // From authMiddleware

    try {
        // Get user's org
        const userResult = await pool.query('SELECT organization_id, department_id FROM users WHERE id = $1', [userId]);
        const { organization_id, department_id } = userResult.rows[0];

        // Calculate CO2e
        const { co2e, factor } = await calculateCO2e(category, subcategory, activity_data, unit);

        // Save to DB
        const newRecord = await pool.query(
            `INSERT INTO emission_records 
      (organization_id, department_id, user_id, category, subcategory, activity_data, unit, emission_factor, calculated_co2e, date, source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
            [organization_id, department_id, userId, category, subcategory, activity_data, unit, factor, co2e, date, 'manual']
        );

        res.status(201).json(newRecord.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all emissions for user's organization
// @route   GET /api/emissions
const getEmissions = async (req, res) => {
    const userId = req.user.id;

    try {
        const userResult = await pool.query('SELECT organization_id FROM users WHERE id = $1', [userId]);
        const { organization_id } = userResult.rows[0];

        const emissions = await pool.query(
            'SELECT * FROM emission_records WHERE organization_id = $1 ORDER BY date DESC',
            [organization_id]
        );

        res.json(emissions.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get analytics summary
// @route   GET /api/emissions/summary
const getSummary = async (req, res) => {
    const userId = req.user.id;
    const year = req.query.year || new Date().getFullYear();

    try {
        const userResult = await pool.query('SELECT organization_id FROM users WHERE id = $1', [userId]);
        const { organization_id } = userResult.rows[0];

        // Total Emissions for selected year
        const totalResult = await pool.query(
            'SELECT SUM(calculated_co2e) as total FROM emission_records WHERE organization_id = $1 AND EXTRACT(YEAR FROM date) = $2',
            [organization_id, year]
        );

        // By Category for selected year
        const byCategoryResult = await pool.query(
            'SELECT category, SUM(calculated_co2e) as total FROM emission_records WHERE organization_id = $1 AND EXTRACT(YEAR FROM date) = $2 GROUP BY category',
            [organization_id, year]
        );

        // By Month for selected year
        // Aggregate by month name to handle multiple entries in same month (though GROUP BY date might be too granular if specific days)
        // Better approach:
        const byMonthAggregated = await pool.query(
            `SELECT 
                TO_CHAR(date, 'Mon') as month, 
                EXTRACT(MONTH FROM date) as month_num, 
                SUM(calculated_co2e) as total,
                SUM(CASE WHEN category = 'electricity' THEN calculated_co2e ELSE 0 END) as electricity,
                SUM(CASE WHEN category = 'transport' THEN calculated_co2e ELSE 0 END) as transport,
                SUM(CASE WHEN category = 'waste' THEN calculated_co2e ELSE 0 END) as waste
              FROM emission_records 
              WHERE organization_id = $1 AND EXTRACT(YEAR FROM date) = $2
              GROUP BY month, month_num
              ORDER BY month_num ASC`,
            [organization_id, year]
        );

        // Previous Year Data for Trends
        const prevYear = year - 1;
        const prevTotalResult = await pool.query(
            'SELECT SUM(calculated_co2e) as total FROM emission_records WHERE organization_id = $1 AND EXTRACT(YEAR FROM date) = $2',
            [organization_id, prevYear]
        );
        const prevByCategoryResult = await pool.query(
            'SELECT category, SUM(calculated_co2e) as total FROM emission_records WHERE organization_id = $1 AND EXTRACT(YEAR FROM date) = $2 GROUP BY category',
            [organization_id, prevYear]
        );

        // Helper: Calculate % Change
        const calcChange = (current, previous) => {
            const curr = Number(current) || 0;
            const prev = Number(previous) || 0;
            if (prev === 0) return 0; // Or null if we want to hide it
            return ((curr - prev) / prev) * 100;
        };

        const currentTotal = totalResult.rows[0].total || 0;
        const prevTotal = prevTotalResult.rows[0].total || 0;
        const totalChange = calcChange(currentTotal, prevTotal);

        // Map categories with change
        const byCategoryWithChange = byCategoryResult.rows.map(cat => {
            const prevCat = prevByCategoryResult.rows.find(p => p.category === cat.category);
            const prevVal = prevCat ? prevCat.total : 0;
            return {
                ...cat,
                change: calcChange(cat.total, prevVal)
            };
        });

        res.json({
            totalEmissions: currentTotal,
            totalEmissionsChange: totalChange,
            byCategory: byCategoryWithChange,
            byMonth: byMonthAggregated.rows
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get comparison data (Yearly & Monthly trends)
// @route   GET /api/emissions/comparison
const getComparison = async (req, res) => {
    const userId = req.user.id;

    try {
        const userResult = await pool.query('SELECT organization_id FROM users WHERE id = $1', [userId]);
        const { organization_id } = userResult.rows[0];

        // 1. Yearly Comparison (Last 5 Years)
        const yearlyResult = await pool.query(
            `SELECT EXTRACT(YEAR FROM date) as year, SUM(calculated_co2e) as total 
             FROM emission_records 
             WHERE organization_id = $1 
             GROUP BY year 
             ORDER BY year ASC 
             LIMIT 5`,
            [organization_id]
        );

        // 2. Monthly Trends (Current Year vs Last Year)
        // We fetch data for the current year and the previous year
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        const monthlyResult = await pool.query(
            `SELECT 
                EXTRACT(YEAR FROM date) as year,
                EXTRACT(MONTH FROM date) as month,
                SUM(calculated_co2e) as total
             FROM emission_records 
             WHERE organization_id = $1 
               AND EXTRACT(YEAR FROM date) IN ($2, $3)
             GROUP BY year, month
             ORDER BY year, month`,
            [organization_id, currentYear, previousYear]
        );

        // Process monthly data into a comparison format
        // Structure: [{ month: 'Jan', current: 100, previous: 90 }, ...]
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // DEBUG TRACE
        const fs = require('fs');
        const tracePath = path.join(__dirname, '../debug_trace.txt');
        const debugInfo = {
            orgId: organization_id,
            currentYear,
            previousYear,
            monthlyRaw: monthlyResult.rows,
            yearlyRaw: yearlyResult.rows
        };
        fs.appendFileSync(tracePath, JSON.stringify(debugInfo, null, 2) + '\n---\n');
        // END DEBUG

        const monthlyData = months.map((name, index) => {
            const monthNum = index + 1;
            const currentEntry = monthlyResult.rows.find(r => Number(r.year) === currentYear && Number(r.month) === monthNum);
            const prevEntry = monthlyResult.rows.find(r => Number(r.year) === previousYear && Number(r.month) === monthNum);

            return {
                month: name,
                thisYear: currentEntry ? Number(currentEntry.total) : 0,
                lastYear: prevEntry ? Number(prevEntry.total) : 0
            };
        });

        res.json({
            yearly: yearlyResult.rows.map(r => ({ year: r.year, total: Number(r.total) })),
            monthly: monthlyData
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get public stats for landing page
// @route   GET /api/emissions/public/stats
const getPublicStats = async (req, res) => {
    try {
        // 1. Total Tracked (Global)
        const totalResult = await pool.query('SELECT SUM(calculated_co2e) as total FROM emission_records');
        const totalTracked = Number(totalResult.rows[0].total) || 0;

        // 2. Reduction (Simple Month-over-Month logic)
        const date = new Date();
        const currentMonth = date.getMonth() + 1;
        const currentYear = date.getFullYear();
        // Previous month logic
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        const currentMonthResult = await pool.query(
            'SELECT SUM(calculated_co2e) as total FROM emission_records WHERE EXTRACT(MONTH FROM date) = $1 AND EXTRACT(YEAR FROM date) = $2',
            [currentMonth, currentYear]
        );
        const prevMonthResult = await pool.query(
            'SELECT SUM(calculated_co2e) as total FROM emission_records WHERE EXTRACT(MONTH FROM date) = $1 AND EXTRACT(YEAR FROM date) = $2',
            [prevMonth, prevMonthYear]
        );

        const currentSum = Number(currentMonthResult.rows[0].total) || 0;
        const prevSum = Number(prevMonthResult.rows[0].total) || 0;

        let reduction = 0;
        // If we have previous data, calculate reduction. If current < prev, that's a reduction (positive %).
        if (prevSum > 0) {
            reduction = ((prevSum - currentSum) / prevSum) * 100;
        }

        // 3. Goal Progress (Arbitrary "Global Goal" of 100,000 kg for demo purposes)
        const goal = 100000;
        const progress = Math.min((totalTracked / goal) * 100, 100);

        res.json({
            tracked: totalTracked,
            reduced: reduction.toFixed(1),
            progress: progress.toFixed(0)
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    createEmission,
    getEmissions,
    getSummary,
    getComparison,
    getPublicStats
};
