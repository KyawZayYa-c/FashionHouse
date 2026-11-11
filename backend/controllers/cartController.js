const catchAsync = require('../src/utils/catchAsync');
const responseHandler = require('../src/utils/responseHandler');
const Product = require('../src/models/Product');
const Cart = require('../src/models/Cart');

// Decimal128 / string / number -> finite JS number (prices are stored as Decimal128).
const toNum = (v) => {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = Number(typeof v.toString === 'function' ? v.toString() : v);
  return Number.isFinite(n) ? n : 0;
};

// Populate enough product fields for the storefront to render cart lines.
const CART_POPULATE = 'productName price images slug variants';

const recalcTotal = (cart) => {
  cart.totalAmount = cart.items.reduce(
    (sum, item) => sum + toNum(item.price) * (item.quantity || 1),
    0
  );
};

const getCart = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const cart = await Cart.findOne({ userId: req.user._id }).populate(
    'items.productId',
    CART_POPULATE
  );

  responseHandler.success(res, 200, { cart: cart || { items: [], totalAmount: 0 } }, 'Cart retrieved successfully');
});

const addToCart = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const { productId, variantId, quantity } = req.body;
  const qty = Math.max(1, Number(quantity) || 1);

  if (!productId) {
    responseHandler.error(res, 400, 'Product ID is required');
    return;
  }

  const product = await Product.findById(productId);
  if (!product) {
    responseHandler.error(res, 404, 'Product not found');
    return;
  }

  const variant = product.variants.find((v) => v._id.toString() === String(variantId));
  if (!variant) {
    responseHandler.error(res, 404, 'Variant not found for this product');
    return;
  }

  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    cart = new Cart({ userId: req.user._id, items: [], totalAmount: 0 });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.productId.toString() === productId &&
      item.variantId.toString() === String(variantId)
  );

  const currentQty = existingItemIndex >= 0 ? cart.items[existingItemIndex].quantity : 0;
  if (variant.stock < currentQty + qty) {
    responseHandler.error(res, 400, `Insufficient stock. Available: ${variant.stock}`);
    return;
  }

  // Effective unit price = base price + variant surcharge, stored as a number.
  const unitPrice = toNum(product.price) + toNum(variant.additionalPrice);

  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].quantity = currentQty + qty;
    cart.items[existingItemIndex].price = unitPrice;
  } else {
    cart.items.push({
      productId: product._id,
      variantId: variant._id,
      quantity: qty,
      price: unitPrice,
    });
  }

  recalcTotal(cart);
  await cart.save();

  const populated = await Cart.findById(cart._id).populate('items.productId', CART_POPULATE);
  responseHandler.success(res, 201, { cart: populated }, 'Item added to cart successfully');
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

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    responseHandler.error(res, 404, 'Cart not found');
    return;
  }

  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.productId.toString() === productId &&
      (variantId ? item.variantId.toString() === String(variantId) : true)
  );

  if (existingItemIndex < 0) {
    responseHandler.error(res, 404, 'Item not found in cart');
    return;
  }

  if (quantity !== undefined) {
    cart.items[existingItemIndex].quantity = Math.max(1, Number(quantity) || 1);
  }

  recalcTotal(cart);
  await cart.save();

  const populated = await Cart.findById(cart._id).populate('items.productId', CART_POPULATE);
  responseHandler.success(res, 200, { cart: populated }, 'Cart item updated successfully');
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

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    responseHandler.error(res, 404, 'Cart not found');
    return;
  }

  cart.items = cart.items.filter(
    (item) =>
      !(
        item.productId.toString() === productId &&
        (variantId ? item.variantId.toString() === String(variantId) : true)
      )
  );

  recalcTotal(cart);
  await cart.save();

  const populated = await Cart.findById(cart._id).populate('items.productId', CART_POPULATE);
  responseHandler.success(res, 200, { cart: populated }, 'Cart item removed successfully');
});

const clearCart = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  await Cart.findOneAndDelete({ userId: req.user._id });
  responseHandler.success(res, 200, { cart: { items: [], totalAmount: 0 } }, 'Cart cleared successfully');
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};