const catchAsync = require('../../utils/catchAsync');
const responseHandler = require('../../utils/responseHandler');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const AppError = require('../../utils/errors').AppError;
const NotFoundError = require('../../utils/errors').NotFoundError;

const getCart = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const cart = await Cart.findOne({ userId: req.user._id }).populate(
    'items.productId',
    'productName price'
  );

  responseHandler.success(res, 200, { cart }, 'Cart retrieved successfully');
});

const addToCart = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const { productId, variantId, quantity } = req.body;

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

  // Check if variant exists in product
  const variant = product.variants.find(
    (v) => v._id.toString() === variantId
  );
  if (!variant) {
    responseHandler.error(res, 404, 'Variant not found for this product');
    return;
  }

  // Check stock availability
  if (variant.stock < (quantity || 1)) {
    responseHandler.error(
      res,
      400,
      `Insufficient stock. Available: ${variant.stock}`
    );
    return;
  }

  // Find or create cart for user
  let cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    cart = new Cart({
      userId: req.user._id,
      items: [],
      totalAmount: 0,
    });
  }

  // Check if item already in cart
  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.productId.toString() === productId &&
      (variantId
        ? item.variantId.toString() === variantId.toString()
        : true)
  );

  if (existingItemIndex >= 0) {
    // Increase quantity if item exists
    cart.items[existingItemIndex].quantity =
      (cart.items[existingItemIndex].quantity || 1) + (quantity || 1);
  } else {
    // Add new item
    cart.items.push({
      productId: product._id,
      variantId: variant._id,
      quantity: quantity || 1,
      price: variant.price || product.price,
    });
  }

  // Recalculate total
  let total = 0;
  for (const item of cart.items) {
    const qty = item.quantity || 1;
    const price = item.price || 0;
    total += qty * price;
  }
  cart.totalAmount = total;

  await cart.save();

  responseHandler.success(res, 201, { cart }, 'Item added to cart successfully');
});

const updateCartItem = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const { productId, variantId, quantity } = req.body;

  if (!productId) {
    responseHandler.error(res, 400, 'Product ID is required');
    return;
  }

  let cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    responseHandler.error(res, 404, 'Cart not found');
    return;
  }

  // Find the item
  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.productId.toString() === productId &&
      (variantId ? item.variantId.toString() === variantId.toString() : true)
  );

  if (existingItemIndex >= 0) {
    // Update quantity
    if (quantity !== undefined) {
      cart.items[existingItemIndex].quantity = Math.max(1, quantity);
    }
  } else {
    responseHandler.error(res, 404, 'Item not found in cart');
    return;
  }

  // Recalculate total
  let total = 0;
  for (const item of cart.items) {
    const qty = item.quantity || 1;
    const price = item.price || 0;
    total += qty * price;
  }
  cart.totalAmount = total;

  await cart.save();

  responseHandler.success(res, 200, { cart }, 'Cart item updated successfully');
});

const removeCartItem = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const { productId, variantId } = req.body;

  if (!productId) {
    responseHandler.error(res, 400, 'Product ID is required');
    return;
  }

  let cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    responseHandler.error(res, 404, 'Cart not found');
    return;
  }

  // Remove item from cart
  cart.items = cart.items.filter(
    (item) =>
      !(item.productId.toString() === productId &&
        (variantId ? item.variantId.toString() === variantId.toString() : true))
  );

  // Recalculate total
  let total = 0;
  for (const item of cart.items) {
    const qty = item.quantity || 1;
    const price = item.price || 0;
    total += qty * price;
  }
  cart.totalAmount = total;

  await cart.save();

  responseHandler.success(res, 200, { cart }, 'Cart item removed successfully');
});

const clearCart = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const cart = await Cart.findOneAndDelete({ userId: req.user._id });

  responseHandler.success(res, 200, { cart: {} }, 'Cart cleared successfully');
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};