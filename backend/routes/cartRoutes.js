const express = require('express');
const router = express.Router();
const authMiddleware = require('../src/utils/middleware/authMiddleware');
const cartController = require('../controllers/cartController');

// All cart routes require authentication

router.get('/', authMiddleware, cartController.getCart);

router.post('/items', authMiddleware, cartController.addToCart);

router.put('/items/:itemId', authMiddleware, cartController.updateCartItem);

router.delete('/items/:itemId', authMiddleware, cartController.removeCartItem);

router.delete('/clear', authMiddleware, cartController.clearCart);

module.exports = router;