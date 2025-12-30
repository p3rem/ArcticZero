const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getOrganizationUsers, addUser, deleteUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getMe);
router.get('/users', authMiddleware, getOrganizationUsers);
router.post('/users', authMiddleware, addUser);
router.delete('/users/:id', authMiddleware, deleteUser);

module.exports = router;
