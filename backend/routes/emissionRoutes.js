const express = require('express');
const router = express.Router();
const { createEmission, getEmissions, getSummary, getComparison, getPublicStats } = require('../controllers/emissionController');
const authMiddleware = require('../middleware/authMiddleware');

// Public Route
router.get('/public/stats', getPublicStats);

router.post('/', authMiddleware, createEmission);
router.get('/', authMiddleware, getEmissions);
router.get('/summary', authMiddleware, getSummary);
router.get('/comparison', authMiddleware, getComparison);

module.exports = router;
