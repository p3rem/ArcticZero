const express = require('express');
const router = express.Router();
const { generatePDF, generateExcel, getReports } = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getReports);
router.get('/pdf', authMiddleware, generatePDF);
router.get('/excel', authMiddleware, generateExcel);

module.exports = router;
