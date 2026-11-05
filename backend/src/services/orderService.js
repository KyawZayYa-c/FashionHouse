const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const AppError = require('../utils/errors').AppError;
const ValidationError = require('../utils/errors').ValidationError;
const NotFoundError = require('../utils/errors').NotFoundError;
const catchAsync = require('../utils/catchAsync');

/**
 * Create order from customer cart
 * @param {Object} customerId - The user ID creating the order
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} The created order
 */
const createOrderFromCart = catchAsync(async (customerId, options = {}) => {
  const { deliveryFee = 0, discount = 0 } = options;

  // 1. Find and validate the customer's cart
  const cart = await Cart.findOne({ userId: customerId }).populate('items.productId');
  if (!cart) {
    throw new NotFoundError('Cart');
  }

  // 2. Validate each cart item: check product existence, stock, and pricing
  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const { productId, variantId, quantity, price } = item;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError(`Product with ID ${productId}`);
    }

    // Validate variant exists within product
    const variant = product.variants.find(
      (v) => v._id.toString() === variantId.toString()
    );
    if (!variant) {
      throw new ValidationError(`Variant not found for product ${product.productName}`);
    }

    // Validate stock availability
    if (variant.stock < quantity) {
      throw new ValidationError(
        `Insufficient stock for ${product.productName}. Available: ${variant.stock}`
      );
    }

    // Use current product price (never trust client-submitted price)
    const currentPrice = variant.price || product.price || 0;
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
  }

  // 3. Validate shipping address
  const shippingAddress = cart.addresses.find((addr) => addr.isDefault);
  if (!shippingAddress) {
    // Try using the first address if no default is marked
    const firstAddress = cart.addresses[0];
    if (!firstAddress) {
      throw new ValidationError('No shipping address found in cart');
    }
  }

  // 4. Generate unique order number
  const prefix = 'ORD';
  const randomSuffix = Math.random().toString(36).substr(2, 8).toUpperCase();
  const dateSuffix = new Date().getFullYear().toString();
  let orderNumber;
  let attempts = 0;
  do {
    orderNumber = `${prefix}-${dateSuffix}-${randomSuffix}-${Math.floor(
      Math.random() * 10000
    )
      .toString()
      .padStart(4, '0')}`;
    attempts++;
    if (attempts > 10) {
      // Fallback to UUID-based order number
      orderNumber = `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 12).toUpperCase}`;
      break;
    }
  } while (await Order.findOne({ orderNumber }));
  // }

  // 5. Create the order with snapshots
  const order = await Order.create({
    userId: customerId,
    orderNumber,
    items: orderItems,
    shippingAddress: {
      recipientName: shippingAddress.recipientName,
      phone: shippingAddress.phone,
      address: shippingAddress.address,
      township: shippingAddress.township,
      city: shippingAddress.city,
    },
    subtotal,
    deliveryFee: Number(deliveryFee) || 0,
    discount: Number(discount) || 0,
    totalAmount: (Number(subtotal) || 0) + (Number(deliveryFee) || 0) - (Number(discount) || 0),
    orderStatus: 'pending',
    paymentStatus: 'unpaid',
  });

  // 6. Calculate totals using the model method
  await order.calculateTotals();

  // 7. Update product stock using MongoDB transaction
  // We'll do this after order creation to ensure order is saved first
  // In a full implementation, this would use session transactions

  // 8. Clear the cart only after successful order creation
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
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = { userId };
  if (status && status !== 'all') {
    filter.orderStatus = status;
  }

  // Use aggregation for better performance with large datasets
  const orders = await Order.aggregate([
    { $match: filter },
    { $sort: { createdAt: -1 } },
    { $skip: skip * 1 },
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

module.exports = {
  createOrderFromCart,
  getCustomerOrders,
  getOrderById,
  getOrderByOrderNumber,
  validateOrderOwnership,
  cancelOrder,
  getOrderDetails,
};