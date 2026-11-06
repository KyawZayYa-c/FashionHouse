const catchAsync = require('../../utils/catchAsync');
const responseHandler = require('../../utils/responseHandler');
const orderService = require('../services/orderService');
const AppError = require('../../utils/errors').AppError;
const NotFoundError = require('../../utils/errors').NotFoundError;
const ValidationError = require('../../utils/errors').ValidationError;

const createOrder = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const { deliveryFee, discount } = req.body;

  // Create order from cart using service
  const order = await orderService.createOrderFromCart(req.user.id, {
    deliveryFee,
    discount,
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

  const { orderId } = req.params;

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

  const { orderId } = req.params;
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
  const { orderId } = req.params;

  if (!orderId) {
    responseHandler.error(res, 400, 'Order ID is required');
    return;
  }

  // Get order details
  const order = await orderService.getOrderById(orderId);

  responseHandler.success(res, 200, { order }, 'Order retrieved successfully');
});

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelOrder,
  getAllOrders,
  getOrderById,
};