const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const wishlistController = require('../controllers/wishlistController');

// All wishlist routes require authentication

router.get('/', authMiddleware, wishlistController.getWishlist);

router.post('/:productId', authMiddleware, wishlistController.addToWishlist);

router.delete('/:productId', authMiddleware, wishlistController.removeFromWishlist);

router.delete('/clear', authMiddleware, wishlistController.clearWishlist);

module.exports = router;