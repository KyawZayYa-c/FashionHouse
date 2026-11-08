const catchAsync = require('../../utils/catchAsync');
const responseHandler = require('../../utils/responseHandler');
const User = require('../models/User');
const Product = require('../models/Product');
const AppError = require('../../utils/errors').AppError;
const NotFoundError = require('../../utils/errors').NotFoundError;

const getWishlist = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const wishlistItems = await User.findById(req.user._id)
    .populate('wishlist.productId', 'productName slug price')
    .select('wishlist');

  responseHandler.success(res, 200, {
    wishlist: wishlistItems ? wishlistItems.wishlist : [],
  }, 'Wishlist retrieved successfully');
});

const addToWishlist = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const { productId } = req.body;

  if (!productId) {
    responseHandler.error(res, 400, 'Product ID is required');
    return;
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    responseHandler.error(res, 404, 'Product not found');
    return;
  }

  // Check if product is already in user's wishlist
  const user = await User.findById(req.user._id);
  if (user.wishlist && user.wishlist.some((p) => p.productId.toString() === productId)) {
    responseHandler.error(res, 409, 'Product already in wishlist');
    return;
  }

  // Add product to wishlist
  if (!user.wishlist) {
    user.wishlist = [];
  }

  user.wishlist.push({
    productId,
    addedAt: new Date(),
  });

  await user.save({ validateBeforeSave: false });

  responseHandler.success(res, 201, {
    wishlist: user.wishlist,
  }, 'Product added to wishlist successfully');
});

const removeFromWishlist = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const { productId } = req.body;

  if (!productId) {
    responseHandler.error(res, 400, 'Product ID is required');
    return;
  }

  // Remove product from wishlist
  const user = await User.findById(req.user._id);

  if (user.wishlist) {
    user.wishlist = user.wishlist.filter(
      (item) => item.productId.toString() !== productId
    );
  }

  await user.save({ validateBeforeSave: false });

  responseHandler.success(res, 200, { productId }, 'Product removed from wishlist successfully');
});

const clearWishlist = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const user = await User.findById(req.user._id);

  if (user.wishlist) {
    user.wishlist = [];
    await user.save({ validateBeforeSave: false });
  }

  responseHandler.success(res, 200, { productId: null }, 'Wishlist cleared successfully');
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
};