const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const productController = require('../controllers/productController');

// Public routes

router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', productController.searchProducts);

// GET /slug/:slug - public
router.get('/slug/:slug', productController.getProductBySlug);

// GET /:id - requires authentication
router.get('/:id', authMiddleware, productController.getProductById);

// POST / - requires authentication
router.post('/', authMiddleware, productController.createProduct);

// PUT /:id - requires authentication
router.put('/:id', authMiddleware, productController.updateProduct);

// DELETE /:id - requires authentication
router.delete('/:id', authMiddleware, productController.deleteProduct);

module.exports = router;