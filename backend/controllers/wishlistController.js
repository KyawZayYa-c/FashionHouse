const catchAsync = require('../src/utils/catchAsync');
const responseHandler = require('../src/utils/responseHandler');
const Product = require('../src/models/Product');
const Wishlist = require('../src/models/Wishlist');

// Wishlist entries live in their own collection ({ userId, productId }, unique
// together). We always return the full populated list so the client can reconcile
// in one step, exactly like the cart.
const WISHLIST_POPULATE = 'productName slug price images';

const getPopulatedWishlist = (userId) =>
  Wishlist.find({ userId })
    .populate('productId', WISHLIST_POPULATE)
    .sort({ createdAt: -1 });

const getWishlist = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const wishlist = await getPopulatedWishlist(req.user._id);
  // Drop entries whose product was deleted (populate returns null).
  const cleaned = wishlist.filter((w) => w.productId);
  responseHandler.success(res, 200, { wishlist: cleaned }, 'Wishlist retrieved successfully');
});

const addToWishlist = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const productId = req.params.productId || req.body.productId;
  if (!productId) {
    responseHandler.error(res, 400, 'Product ID is required');
    return;
  }

  const product = await Product.findById(productId);
  if (!product) {
    responseHandler.error(res, 404, 'Product not found');
    return;
  }

  const existing = await Wishlist.findOne({ userId: req.user._id, productId });
  if (!existing) {
    await Wishlist.create({ userId: req.user._id, productId });
  }

  const wishlist = (await getPopulatedWishlist(req.user._id)).filter((w) => w.productId);
  responseHandler.success(res, 201, { wishlist }, 'Product added to wishlist successfully');
});

const removeFromWishlist = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const productId = req.params.productId || req.body.productId;
  if (!productId) {
    responseHandler.error(res, 400, 'Product ID is required');
    return;
  }

  await Wishlist.deleteOne({ userId: req.user._id, productId });

  const wishlist = (await getPopulatedWishlist(req.user._id)).filter((w) => w.productId);
  responseHandler.success(res, 200, { wishlist }, 'Product removed from wishlist successfully');
});

const clearWishlist = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  await Wishlist.deleteMany({ userId: req.user._id });
  responseHandler.success(res, 200, { wishlist: [] }, 'Wishlist cleared successfully');
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
};