const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// Public routes
router.get('/', projectController.getAll);
router.get('/:id', projectController.getOne);

// Protected Admin routes
router.post('/', requireAuth, projectController.create);
router.put('/:id', requireAuth, projectController.update);
router.delete('/:id', requireAuth, projectController.delete);

module.exports = router;
