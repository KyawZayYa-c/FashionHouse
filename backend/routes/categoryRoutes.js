const express = require('express');
const router = express.Router();
const authMiddleware = require('../src/utils/middleware/authMiddleware');
const adminMiddleware = require('../src/utils/middleware/adminMiddleware');
const categoryController = require('../controllers/categoryController');

// Public routes

router.get('/', categoryController.getCategories);

// GET /:id - requires authentication
router.get('/:id', authMiddleware, categoryController.getCategoryById);

// POST / - requires authentication
router.post('/', authMiddleware, categoryController.createCategory);

// PUT /:id - requires authentication
router.put('/:id', authMiddleware, categoryController.updateCategory);

// DELETE /:id - requires authentication
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

// Admin-only routes

router.post('/admin', adminMiddleware, categoryController.createCategory);
router.put('/admin/:id', adminMiddleware, categoryController.updateCategory);
router.delete('/admin/:id', adminMiddleware, categoryController.deleteCategory);

module.exports = router;