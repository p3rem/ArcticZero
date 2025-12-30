const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/emissions', require('./routes/emissionRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));

// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error', err.stack));

// Basic Route
app.get('/', (req, res) => {
    res.send('Green Footprint Hub API is running');
});

// Temporary Debug Route for DB Diagnosis
app.get('/api/debug-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'');
        const userCount = await pool.query('SELECT count(*) FROM users'); // might fail if table missing
        res.json({
            status: 'connected',
            tables: result.rows.map(r => r.table_name),
            users: userCount.rows[0].count,
            ssl: process.env.NODE_ENV === 'production'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'DB Connection Failed',
            details: err.message,
            stack: err.stack
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { app, pool };
