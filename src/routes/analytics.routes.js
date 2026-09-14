const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/track', analyticsController.track);
router.get('/summary', requireAuth, analyticsController.getSummary);

module.exports = router;
