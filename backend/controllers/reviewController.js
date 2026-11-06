const catchAsync = require('../../utils/catchAsync');
const responseHandler = require('../../utils/responseHandler');
const reviewService = require('../services/reviewService');
const AppError = require('../../utils/errors').AppError;
const NotFoundError = require('../../utils/errors').NotFoundError;
const ValidationError = require('../../utils/errors').ValidationError;

const createReview = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const { productId, orderId, rating, reviewText } = req.body;

  if (!productId) {
    responseHandler.error(res, 400, 'Product ID is required');
    return;
  }

  if (rating === undefined || rating < 1 || rating > 5) {
    responseHandler.error(res, 400, 'Rating must be between 1 and 5');
    return;
  }

  // Create review using service
  const review = await reviewService.createReview(
    req.user.id,
    productId,
    orderId,
    rating,
    reviewText
  );

  responseHandler.success(res, 201, { review }, 'Review created successfully');
});

const getProductReviews = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, rating } = req.query;

  if (!productId) {
    responseHandler.error(res, 400, 'Product ID is required');
    return;
  }

  // Get product reviews using service
  const reviews = await reviewService.getProductReviews(productId, {
    page: Number(page),
    limit: Number(limit),
    rating: rating ? Number(rating) : undefined,
  });

  responseHandler.success(res, 200, reviews, 'Product reviews retrieved successfully');
});

const getMyReviews = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  // Get customer reviews using service
  const reviews = await reviewService.getCustomerReviews(req.user.id, {
    page: req.query.page,
    limit: req.query.limit,
  });

  responseHandler.success(res, 200, reviews, 'Your reviews retrieved successfully');
});

const updateReview = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const { reviewId } = req.params;
  const { rating, reviewText } = req.body;

  if (!reviewId) {
    responseHandler.error(res, 400, 'Review ID is required');
    return;
  }

  if (rating !== undefined && (rating < 1 || rating > 5)) {
    responseHandler.error(res, 400, 'Rating must be between 1 and 5');
    return;
  }

  // Update review using service
  const updatedReview = await reviewService.updateReview(reviewId, req.user.id, rating, reviewText);

  responseHandler.success(res, 200, { review: updatedReview }, 'Review updated successfully');
});

const deleteReview = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const { reviewId } = req.params;

  if (!reviewId) {
    responseHandler.error(res, 400, 'Review ID is required');
    return;
  }

  // Delete review using service
  await reviewService.deleteReview(reviewId, req.user.id);

  responseHandler.success(res, 200, { reviewId }, 'Review deleted successfully');
});

module.exports = {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};