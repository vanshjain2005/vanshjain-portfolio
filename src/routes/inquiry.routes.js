const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiry.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { contactLimiter } = require('../middleware/security');

// Public contact submission (rate-limited)
router.post('/', contactLimiter, inquiryController.submit);

// Protected Admin routes
router.get('/', requireAuth, inquiryController.list);
router.patch('/:id', requireAuth, inquiryController.updateStatus);
router.delete('/:id', requireAuth, inquiryController.delete);

module.exports = router;
