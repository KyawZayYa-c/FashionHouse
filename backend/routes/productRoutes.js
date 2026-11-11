const express = require('express');
const router = express.Router();
const authMiddleware = require('../src/utils/middleware/authMiddleware');
const adminMiddleware = require('../src/utils/middleware/adminMiddleware');
const productController = require('../controllers/productController');

// Public routes

router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', productController.searchProducts);

// GET /slug/:slug - public
router.get('/slug/:slug', productController.getProductBySlug);

// GET /:id - requires authentication
router.get('/:id', authMiddleware, productController.getProductById);

// POST / - admin only
router.post('/', authMiddleware, adminMiddleware, productController.createProduct);

// PUT /:id - admin only
router.put('/:id', authMiddleware, adminMiddleware, productController.updateProduct);

// DELETE /:id - admin only
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

module.exports = router;