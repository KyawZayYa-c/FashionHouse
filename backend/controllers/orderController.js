const catchAsync = require('../src/utils/catchAsync');
const responseHandler = require('../src/utils/responseHandler');
const orderService = require('../src/services/orderService');
const AppError = require('../src/utils/errors').AppError;
const NotFoundError = require('../src/utils/errors').NotFoundError;
const ValidationError = require('../src/utils/errors').ValidationError;

const createOrder = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const { deliveryFee, discount, shippingAddress, notes, paymentMethod } = req.body;

  // Create order from cart using service
  const order = await orderService.createOrderFromCart(req.user.id, {
    deliveryFee,
    discount,
    shippingAddress,
    notes,
    paymentMethod,
  });

  responseHandler.success(res, 201, { order }, 'Order created successfully');
});

const getMyOrders = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const orders = await orderService.getCustomerOrders(req.user.id, {
    page: req.query.page,
    limit: req.query.limit,
  });

  responseHandler.success(res, 200, orders, 'Orders retrieved successfully');
});

const getMyOrderById = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const orderId = req.params.orderId || req.params.id;

  if (!orderId) {
    responseHandler.error(res, 400, 'Order ID is required');
    return;
  }

  // Validate ownership first
  const order = await orderService.validateOrderOwnership(orderId, req.user.id);

  // Get detailed order information
  const orderDetails = await orderService.getOrderDetails(orderId);

  responseHandler.success(res, 200, { order: orderDetails }, 'Order retrieved successfully');
});

const cancelOrder = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const orderId = req.params.orderId || req.params.id;
  const { reason } = req.body;

  if (!orderId) {
    responseHandler.error(res, 400, 'Order ID is required');
    return;
  }

  // Validate ownership
  const order = await orderService.validateOrderOwnership(orderId, req.user.id);

  // Check if order can be cancelled
  if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
    responseHandler.error(res, 400, 'Cannot cancel order. Order has been shipped or delivered.');
    return;
  }

  // Cancel order using service
  const cancelledOrder = await orderService.cancelOrder(orderId, req.user.id, { reason });

  responseHandler.success(res, 200, { order: cancelledOrder }, 'Order cancelled successfully');
});

const getAllOrders = catchAsync(async (req, res) => {
  // Admin only - will check role in middleware
  const { page = 1, limit = 10, status } = req.query;

  const filters = {};
  if (status) filters.orderStatus = status;

  const orders = await orderService.getAllOrdersWithFilters(filters, {
    page: Number(page),
    limit: Number(limit),
  });

  responseHandler.success(res, 200, orders, 'Orders retrieved successfully');
});

const getOrderById = catchAsync(async (req, res) => {
  const orderId = req.params.orderId || req.params.id;

  if (!orderId) {
    responseHandler.error(res, 400, 'Order ID is required');
    return;
  }

  // Get order details
  const order = await orderService.getOrderById(orderId);

  responseHandler.success(res, 200, { order }, 'Order retrieved successfully');
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const orderId = req.params.id || req.params.orderId;
  const { status } = req.body;

  if (!orderId) {
    responseHandler.error(res, 400, 'Order ID is required');
    return;
  }
  if (!status) {
    responseHandler.error(res, 400, 'Order status is required');
    return;
  }

  const order = await orderService.updateOrderStatus(orderId, status);
  responseHandler.success(res, 200, { order }, 'Order status updated successfully');
});

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};