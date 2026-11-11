const mongoose = require('mongoose');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/errors').AppError;
const NotFoundError = require('../utils/errors').NotFoundError;
const ValidationError = require('../utils/errors').ValidationError;
const ConflictError = require('../utils/errors').ConflictError;
const catchAsync = (fn) => fn;

/**
 * Create product review
 * @param {Object} userId - The user ID
 * @param {Object} productId - The product ID
 * @param {Object} orderId - The order ID (to verify purchase)
 * @param {Object} rating - The rating (1-5)
 * @param {Object} reviewText - The review text
 * @returns {Promise<Object>} The created review
 */
const createReview = catchAsync(async (userId, productId, orderId, rating, reviewText) => {
  // 1. Validate rating between 1 and 5
  if (rating < 1 || rating > 5) {
    throw new ValidationError('Rating must be between 1 and 5');
  }

  // 2. Validate order exists and belongs to user
  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError('Order');
  }

  if (order.userId.toString() !== userId.toString()) {
    throw new AppError('Not authorized to review this order', 403);
  }

  // 3. Validate that the order actually contains the product
  const orderItem = order.items.find(
    (item) => item.productId.toString() === productId.toString()
  );

  if (!orderItem) {
    throw new ValidationError('This product was not purchased in this order');
  }

  // 4. Check for duplicate review (same product and order)
  const existingReview = await Review.findOne({ userId, productId, orderId });
  if (existingReview) {
    throw new ConflictError('You have already reviewed this product for this order');
  }

  // 5. Create the review
  const review = await Review.create({
    userId,
    productId,
    orderId,
    rating,
    reviewText: reviewText || '',
  });

  // 6. Update product's review count and average rating. The rating average is
  //    recomputed from all reviews for the product via an aggregation, then
  //    written with a plain $set — aggregation operators cannot be used inside
  //    a normal update document.
  const productIdObj = new mongoose.Types.ObjectId(String(productId));
  await Product.updateOne({ _id: productIdObj }, { $inc: { reviewCount: 1 } });

  const ratingStats = await Review.aggregate([
    { $match: { productId: productIdObj } },
    { $group: { _id: null, averageRating: { $avg: '$rating' } } },
  ]);
  if (ratingStats.length > 0) {
    await Product.updateOne(
      { _id: productIdObj },
      { $set: { averageRating: ratingStats[0].averageRating } }
    );
  }

  return review;
});

/**
 * Get product reviews with pagination
 * @param {Object} productId - The product ID
 * @param {Object} query - Query parameters (page, limit, etc.)
 * @returns {Promise<Object>} Paginated reviews
 */
const getProductReviews = catchAsync(async (productId, query = {}) => {
  const { page = 1, limit = 10, rating } = query;
  const skip = (page - 1) * limit;

  // Build filter. Aggregation $match does not auto-cast strings to ObjectId,
  // so cast the productId explicitly.
  const filter = { productId: new mongoose.Types.ObjectId(String(productId)) };
  if (rating) {
    filter.rating = Number(rating);
  }

  // Get reviews with user info
  const reviews = await Review.aggregate([
    { $match: filter },
    { $sort: { createdAt: -1 } },
    { $skip: skip * 1 },
    { $limit: Number(limit) },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 1,
        rating: 1,
        reviewText: 1,
        createdAt: 1,
        'user.username': 1,
        // Inclusion projection: email is simply omitted (mixing exclusions in
        // an inclusion projection is invalid in MongoDB).
      },
    },
  ]);

  // Get total count
  const totalReviews = await Review.countDocuments(filter);

  return {
    reviews,
    totalPages: Math.ceil(totalReviews / limit),
    currentPage: Number(page),
    totalReviews,
  };
});

/**
 * Get customer's reviews
 * @param {Object} userId - The user ID
 * @param {Object} query - Query parameters
 * @returns {Promise<Object>} Customer's reviews
 */
const getCustomerReviews = catchAsync(async (userId, query = {}) => {
  const { page = 1, limit = 10, productId } = query;
  const skip = (page - 1) * limit;

  // Cast userId for the same aggregation $match reason as above.
  const filter = { userId: new mongoose.Types.ObjectId(String(userId)) };
  if (productId) {
    filter.productId = new mongoose.Types.ObjectId(String(productId));
  }

  const reviews = await Review.aggregate([
    { $match: filter },
    { $sort: { createdAt: -1 } },
    { $skip: skip * 1 },
    { $limit: Number(limit) },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $project: {
        _id: 1,
        rating: 1,
        reviewText: 1,
        createdAt: 1,
        'product.productName': 1,
        'product.brand': 1,
      },
    },
  ]);

  const totalReviews = await Review.countDocuments(filter);

  return {
    reviews,
    totalPages: Math.ceil(totalReviews / limit),
    currentPage: Number(page),
    totalReviews,
  };
});

/**
 * Update review
 * @param {Object} reviewId - The review ID
 * @param {Object} userId - The user ID (for ownership check)
 * @param {Object} rating - New rating (optional)
 * @param {Object} reviewText - New review text (optional)
 * @returns {Promise<Object>} The updated review
 */
const updateReview = catchAsync(async (reviewId, userId, rating, reviewText) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new NotFoundError('Review');
  }

  // Validate ownership
  if (review.userId.toString() !== userId.toString()) {
    throw new AppError('Not authorized to update this review', 403);
  }

  // Update fields if provided
  if (rating !== undefined) {
    if (rating < 1 || rating > 5) {
      throw new ValidationError('Rating must be between 1 and 5');
    }
    review.rating = rating;
  }

  if (reviewText !== undefined) {
    review.reviewText = reviewText;
  }

  await review.save();

  return review;
});

/**
 * Delete review
 * @param {Object} reviewId - The review ID
 * @param {Object} userId - The user ID (for ownership check)
 * @returns {Promise<Object>} The deleted review
 */
const deleteReview = catchAsync(async (reviewId, userId) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new NotFoundError('Review');
  }

  // Validate ownership
  if (review.userId.toString() !== userId.toString()) {
    throw new AppError('Not authorized to delete this review', 403);
  }

  await Review.findByIdAndDelete(reviewId);

  return review;
});

/**
 * Calculate average rating for a product
 * @param {Object} productId - The product ID
 * @returns {Promise<Object>} Average rating and review count
 */
const calculateAverageRating = catchAsync(async (productId) => {
  const result = await Review.aggregate([
    { $match: { productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0) {
    return { averageRating: 0, reviewCount: 0 };
  }

  return {
    averageRating: Number(result[0].averageRating).toFixed(1),
    reviewCount: result[0].reviewCount,
  };
});

module.exports = {
  createReview,
  getProductReviews,
  getCustomerReviews,
  updateReview,
  deleteReview,
  calculateAverageRating,
};