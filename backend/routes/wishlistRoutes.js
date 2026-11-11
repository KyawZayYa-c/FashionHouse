const express = require('express');
const router = express.Router();
const authMiddleware = require('../src/utils/middleware/authMiddleware');
const wishlistController = require('../controllers/wishlistController');

// All wishlist routes require authentication.

router.get('/', authMiddleware, wishlistController.getWishlist);

// `/clear` MUST be declared before `/:productId`, otherwise "clear" is captured
// as a productId and routed to removeFromWishlist.
router.delete('/clear', authMiddleware, wishlistController.clearWishlist);

router.post('/:productId', authMiddleware, wishlistController.addToWishlist);

router.delete('/:productId', authMiddleware, wishlistController.removeFromWishlist);

module.exports = router;