const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { loginLimiter } = require('../middleware/security');

router.post('/login', loginLimiter, authController.login);
router.get('/me', requireAuth, authController.getMe);
router.post('/change-password', requireAuth, authController.changePassword);

module.exports = router;
