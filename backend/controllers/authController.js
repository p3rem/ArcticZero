const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Helper: Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    const { name, email, password, role, organization_name } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Please add all fields' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        // Check if user exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create Organization if provided (simplified logic: create new org for every register if org_name is passed, or assign to null)
        // For MVP/Demo: If org name provided, create it.
        let orgId = null;
        if (organization_name) {
            const newOrg = await pool.query(
                'INSERT INTO organizations (name) VALUES ($1) RETURNING id',
                [organization_name]
            );
            orgId = newOrg.rows[0].id;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine role: if creating an org, default to 'admin', otherwise 'user'
        const userRole = role || (organization_name ? 'admin' : 'user');

        // Create user
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, organization_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, organization_id',
            [name, email, hashedPassword, userRole, orgId]
        );

        const user = newUser.rows[0];

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organization_id: user.organization_id,
            token: generateToken(user.id, user.role),
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for user email
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization_id: user.organization_id,
                token: generateToken(user.id, user.role),
            });
        } else {
            res.status(400).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const user = await pool.query('SELECT id, name, email, role, organization_id FROM users WHERE id = $1', [req.user.id]);
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all users in organization
// @route   GET /api/auth/users
const getOrganizationUsers = async (req, res) => {
    try {
        const { organization_id } = req.user;
        const users = await pool.query(
            'SELECT id, name, email, role, department_id, created_at FROM users WHERE organization_id = $1 ORDER BY created_at DESC',
            [organization_id]
        );
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Add a new user to organization
// @route   POST /api/auth/users
const addUser = async (req, res) => {
    const { name, email, password, role, department_id } = req.body;
    const { organization_id } = req.user;

    // Sanitize department_id: convert empty string to null
    const deptId = department_id && department_id.trim() !== '' ? department_id : null;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Please add all required fields' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        // Check if user exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, organization_id, department_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, department_id, created_at',
            [name, email, hashedPassword, role || 'user', organization_id, deptId]
        );

        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { organization_id } = req.user;

        // Prevent deleting self
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }

        const deleteOp = await pool.query(
            'DELETE FROM users WHERE id = $1 AND organization_id = $2 RETURNING id',
            [id, organization_id]
        );

        if (deleteOp.rows.length === 0) {
            return res.status(404).json({ error: 'User not found or not in your organization' });
        }

        res.json({ message: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    getOrganizationUsers,
    addUser,
    deleteUser
};
