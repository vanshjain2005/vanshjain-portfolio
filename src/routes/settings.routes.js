const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', settingsController.getSettings);
router.put('/', requireAuth, settingsController.updateSettings);

module.exports = router;
