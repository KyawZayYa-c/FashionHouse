const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const reviewController = require('../controllers/reviewController');

// Public routes - product reviews viewing

router.get('/product/:productId', reviewController.getProductReviews);

// Authenticated customer routes

router.post('/', authMiddleware, reviewController.createReview);

router.get('/my-reviews', authMiddleware, reviewController.getMyReviews);

// Authenticated routes with ownership

router.put('/:id', authMiddleware, reviewController.updateReview);

router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;