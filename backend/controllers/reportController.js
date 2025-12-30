const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// @desc    Generate PDF Report
// @route   GET /api/reports/pdf
const generatePDF = async (req, res) => {
    try {
        const userId = req.user.id;
        const year = req.query.year || new Date().getFullYear();

        // Get user's org info
        const userRes = await pool.query('SELECT organization_id, name FROM users WHERE id = $1', [userId]);
        const { organization_id, name } = userRes.rows[0];

        // Fetch Data
        const emissionsRes = await pool.query(
            `SELECT category, SUM(calculated_co2e) as total 
             FROM emission_records 
             WHERE organization_id = $1 AND EXTRACT(YEAR FROM date) = $2 
             GROUP BY category`,
            [organization_id, year]
        );
        const totalRes = await pool.query(
            `SELECT SUM(calculated_co2e) as total 
             FROM emission_records 
             WHERE organization_id = $1 AND EXTRACT(YEAR FROM date) = $2`,
            [organization_id, year]
        );
        const totalEmissions = totalRes.rows[0].total || 0;

        // Create PDF
        const doc = new PDFDocument();

        // Stream to response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=emissions_report_${year}.pdf`);
        doc.pipe(res);

        // Content
        doc.fontSize(25).text('Carbon Footprint Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated for: ${name}`);
        doc.text(`Year: ${year}`);
        doc.text(`Date Generated: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        doc.moveDown();

        doc.fontSize(18).text('Summary', { underline: true });
        doc.moveDown();
        doc.fontSize(14).text(`Total Emissions: ${Number(totalEmissions).toLocaleString()} kg CO2e`);
        doc.moveDown();

        doc.fontSize(16).text('Breakdown by Category:');
        emissionsRes.rows.forEach(row => {
            doc.fontSize(12).text(`- ${row.category.charAt(0).toUpperCase() + row.category.slice(1)}: ${Number(row.total).toLocaleString()} kg CO2e`);
        });

        doc.end();

        // Log Report Generation
        await pool.query(
            'INSERT INTO reports (organization_id, user_id, report_type, date_range_start, date_range_end) VALUES ($1, $2, $3, $4, $5)',
            [organization_id, userId, 'PDF', new Date(year, 0, 1), new Date(year, 11, 31)]
        );

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Generate Excel Export
// @route   GET /api/reports/excel
const generateExcel = async (req, res) => {
    try {
        const userId = req.user.id;
        const year = req.query.year || new Date().getFullYear();

        // Get user's org
        const userRes = await pool.query('SELECT organization_id FROM users WHERE id = $1', [userId]);
        const { organization_id } = userRes.rows[0];

        // Fetch Records for Year
        const recordsRes = await pool.query(
            `SELECT date, category, subcategory, activity_data, unit, calculated_co2e 
             FROM emission_records 
             WHERE organization_id = $1 AND EXTRACT(YEAR FROM date) = $2
             ORDER BY date DESC`,
            [organization_id, year]
        );

        // Create Workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Emissions Data');

        // Columns
        worksheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Category', key: 'category', width: 15 },
            { header: 'Subcategory', key: 'subcategory', width: 20 },
            { header: 'Activity Data', key: 'activity_data', width: 15 },
            { header: 'Unit', key: 'unit', width: 10 },
            { header: 'CO2e (kg)', key: 'calculated_co2e', width: 15 },
        ];

        // Add Rows
        recordsRes.rows.forEach(record => {
            worksheet.addRow({
                date: new Date(record.date).toLocaleDateString(),
                category: record.category,
                subcategory: record.subcategory || '-',
                activity_data: record.activity_data,
                unit: record.unit,
                calculated_co2e: record.calculated_co2e
            });
        });

        // Response
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=emissions_data_${year}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

        // Log Report Generation
        await pool.query(
            'INSERT INTO reports (organization_id, user_id, report_type, date_range_start, date_range_end) VALUES ($1, $2, $3, $4, $5)',
            [organization_id, userId, 'Excel', new Date(year, 0, 1), new Date(year, 11, 31)]
        );

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Get All Reports
// @route   GET /api/reports
const getReports = async (req, res) => {
    try {
        const { organization_id } = req.user;
        const result = await pool.query(
            `SELECT r.*, u.name as generated_by 
             FROM reports r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.organization_id = $1 
             ORDER BY r.created_at DESC`,
            [organization_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    generatePDF,
    generateExcel,
    getReports
};
