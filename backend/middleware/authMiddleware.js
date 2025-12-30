const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

module.exports = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        // Bearer <token>
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);

        // Fetch user from DB to get latest role and organization_id
        const userRes = await pool.query('SELECT id, name, email, role, organization_id FROM users WHERE id = $1', [decoded.id]);

        if (userRes.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = userRes.rows[0];
        next();
    } catch (err) {
        console.error("Auth Middleware Error:", err);
        res.status(401).json({ error: 'Token is not valid' });
    }
};
