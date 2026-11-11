const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const AppError = require('../utils/errors').AppError;
const ValidationError = require('../utils/errors').ValidationError;
const NotFoundError = require('../utils/errors').NotFoundError;
const catchAsync = (fn) => fn;

/**
 * Create order from customer cart
 * @param {Object} customerId - The user ID creating the order
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} The created order
 */
// Decimal128 / string / number -> finite JS number.
const toNum = (v) => {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = Number(typeof v.toString === 'function' ? v.toString() : v);
  return Number.isFinite(n) ? n : 0;
};

const createOrderFromCart = catchAsync(async (customerId, options = {}) => {
  const { deliveryFee = 0, discount = 0, shippingAddress, notes, paymentMethod } = options;

  // 1. Find and validate the customer's cart
  const cart = await Cart.findOne({ userId: customerId });
  if (!cart || !cart.items || cart.items.length === 0) {
    throw new ValidationError('Your cart is empty');
  }

  // 2. Validate the shipping address supplied by the checkout form. (The cart
  //    model has no addresses; the address comes from the request body.)
  const requiredAddressFields = ['recipientName', 'phone', 'address', 'township', 'city'];
  if (
    !shippingAddress ||
    requiredAddressFields.some((f) => !String(shippingAddress[f] || '').trim())
  ) {
    throw new ValidationError('A complete shipping address is required');
  }

  // 3. Validate each cart item: product existence, stock, and current pricing
  const orderItems = [];
  let subtotal = 0;
  const stockUpdates = [];

  for (const item of cart.items) {
    const { productId, variantId, quantity } = item;

    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError(`Product with ID ${productId}`);
    }

    const variant = product.variants.find(
      (v) => v._id.toString() === variantId.toString()
    );
    if (!variant) {
      throw new ValidationError(`Variant not found for product ${product.productName}`);
    }

    if (variant.stock < quantity) {
      throw new ValidationError(
        `Insufficient stock for ${product.productName}. Available: ${variant.stock}`
      );
    }

    // Never trust a client-submitted price; recompute from the catalog.
    const currentPrice = toNum(product.price) + toNum(variant.additionalPrice);
    const itemSubtotal = currentPrice * quantity;

    orderItems.push({
      productId: product._id,
      variantId: variant._id,
      productName: product.productName,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      price: currentPrice,
      quantity,
      subtotal: itemSubtotal,
    });

    subtotal += itemSubtotal;
    stockUpdates.push({ product, variant, quantity });
  }

  // 4. Generate a unique order number
  const orderNumber = `ORD-${new Date().getFullYear()}-${Date.now()
    .toString(36)
    .toUpperCase()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  const fee = toNum(deliveryFee);
  const disc = toNum(discount);
  const totalAmount = Math.max(0, subtotal + fee - disc);

  // 5. Create the order with item/address snapshots and numeric totals
  const order = await Order.create({
    userId: customerId,
    orderNumber,
    items: orderItems,
    shippingAddress: {
      recipientName: String(shippingAddress.recipientName).trim(),
      phone: String(shippingAddress.phone).trim(),
      address: String(shippingAddress.address).trim(),
      township: String(shippingAddress.township).trim(),
      city: String(shippingAddress.city).trim(),
    },
    subtotal,
    deliveryFee: fee,
    discount: disc,
    totalAmount,
    orderStatus: 'pending',
    paymentStatus: paymentMethod === 'paid' ? 'paid' : 'unpaid',
    notes: notes ? String(notes).trim() : undefined,
  });

  // 6. Decrement stock for each purchased variant
  for (const { product, variant, quantity } of stockUpdates) {
    variant.stock = Math.max(0, variant.stock - quantity);
    await product.save({ validateBeforeSave: false });
  }

  // 7. Clear the cart only after a successful order
  await Cart.findByIdAndDelete(cart._id);

  return order;
});

/**
 * Get customer's orders with pagination and filtering
 * @param {Object} userId - The user ID
 * @param {Object} query - Query parameters (page, limit, status, etc.)
 * @returns {Promise<Object>} Paginated orders
 */
const getCustomerOrders = catchAsync(async (userId, query = {}) => {
  const { page = 1, limit = 10, status } = query;
  const skip = (Number(page) - 1) * Number(limit);

  // Build filter object. Aggregation does NOT auto-cast strings to ObjectId the
  // way find() does, so cast explicitly or the $match returns nothing.
  const filter = { userId: new mongoose.Types.ObjectId(String(userId)) };
  if (status && status !== 'all') {
    filter.orderStatus = status;
  }

  // Use aggregation for better performance with large datasets
  const orders = await Order.aggregate([
    { $match: filter },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: Number(limit) },
    {
      $project: {
        orderNumber: 1,
        orderStatus: 1,
        paymentStatus: 1,
        subtotal: 1,
        totalAmount: 1,
        createdAt: 1,
        itemCount: { $size: '$items' },
      },
    },
  ]);

  // Get total count for pagination
  const totalOrders = await Order.countDocuments(filter);

  return {
    orders,
    totalPages: Math.ceil(totalOrders / limit),
    currentPage: Number(page),
    totalOrders,
  };
});

/**
 * Get order by ID
 * @param {Object} orderId - The order ID
 * @returns {Promise<Object>} The order
 */
const getOrderById = catchAsync(async (orderId) => {
  const order = await Order.findById(orderId)
    .populate('userId', 'username email')
    .populate('items.productId', 'productName slug price');

  if (!order) {
    throw new NotFoundError('Order');
  }

  return order;
});

/**
 * Get order by order number
 * @param {String} orderNumber - The order number
 * @returns {Promise<Object>} The order
 */
const getOrderByOrderNumber = catchAsync(async (orderNumber) => {
  const order = await Order.findOne({ orderNumber }).populate(
    'items.productId',
    'productName slug price'
  );

  if (!order) {
    throw new NotFoundError('Order');
  }

  return order;
});

/**
 * Validate order ownership
 * @param {Object} orderId - The order ID
 * @param {Object} userId - The user ID to validate against
 * @returns {Promise<Object>} The order if authorized
 */
const validateOrderOwnership = catchAsync(async (orderId, userId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError('Order');
  }

  if (order.userId.toString() !== userId.toString()) {
    throw new AppError('Not authorized to access this order', 403);
  }

  return order;
});

/**
 * Cancel order
 * @param {Object} orderId - The order ID
 * @param {Object} userId - The user ID
 * @param {Object} options - Cancellation options
 * @returns {Promise<Object>} The cancelled order
 */
const cancelOrder = catchAsync(async (orderId, userId, options = {}) => {
  const { reason } = options;

  const order = await validateOrderOwnership(orderId, userId);

  // Check if order can be cancelled
  if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
    throw new ValidationError(
      'Cannot cancel order. Order has been shipped or delivered. Please initiate a return process instead.'
    );
  }

  if (order.orderStatus === 'returned') {
    throw new ValidationError('Order has already been returned');
  }

  // Update order status to cancelled
  order.orderStatus = 'cancelled';
  order.notes = reason ? `Cancellation reason: ${reason}` : 'Order cancelled';

  // Restore stock for all order items
  for (const item of order.items) {
    const { productId, variantId, quantity } = item;

    // Find the product and variant
    const product = await Product.findById(productId);
    if (product) {
      const variant = product.variants.find(
        (v) => v._id.toString() === variantId.toString()
      );
      if (variant) {
        // Restore stock
        variant.stock += quantity;
        // Reset additionalPrice if it was part of the variant
        if (variant.additionalPrice === undefined) {
          variant.additionalPrice = 0;
        }
        await product.save({ validateBeforeSave: false });
      }
    }
  }

  await order.save();

  return order;
});

/**
 * Get order details with product and variant information
 * @param {Object} orderId - The order ID
 * @returns {Promise<Object>} Detailed order information
 */
const getOrderDetails = catchAsync(async (orderId) => {
  const order = await Order.findById(orderId)
    .populate('userId', 'username email')
    .populate('items.productId', 'productName brand price variants')
    .populate('items.variantId');

  if (!order) {
    throw new NotFoundError('Order');
  }

  return order;
});

const getAllOrdersWithFilters = catchAsync(async (filter = {}, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;

  const orders = await Order.find(filter)
    .populate('userId', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Order.countDocuments(filter);

  return {
    orders,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
    total,
  };
});

const updateOrderStatus = catchAsync(async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError('Order');
  }
  const validStatuses = [
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned',
  ];
  if (!validStatuses.includes(status)) {
    throw new ValidationError('Invalid order status');
  }
  order.orderStatus = status;
  await order.save();
  return order;
});

module.exports = {
  createOrderFromCart,
  getCustomerOrders,
  getOrderById,
  getOrderByOrderNumber,
  validateOrderOwnership,
  cancelOrder,
  getOrderDetails,
  getAllOrdersWithFilters,
  updateOrderStatus,
};