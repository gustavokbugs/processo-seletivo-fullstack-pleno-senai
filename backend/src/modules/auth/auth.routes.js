const express = require('express');
const authController = require('./auth.controller');
const { authenticateToken } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', authController.login);
router.post('/verify', authController.verificarToken);
router.get('/me', authenticateToken, authController.me);

module.exports = router;
