const catchAsync = require('../../utils/catchAsync');
const responseHandler = require('../../utils/responseHandler');
const paymentService = require('../services/paymentService');
const AppError = require('../../utils/errors').AppError;
const NotFoundError = require('../../utils/errors').NotFoundError;

const createPayment = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const { orderId, paymentMethod, amount, transactionReference } = req.body;

  if (!orderId) {
    responseHandler.error(res, 400, 'Order ID is required');
    return;
  }

  // Validate order ownership
  const order = await orderService.validateOrderOwnership(orderId, req.user.id);

  // Create payment using service
  const payment = await paymentService.createPayment(orderId, {
    paymentMethod,
    amount,
    transactionReference,
  });

  responseHandler.success(res, 201, { payment }, 'Payment record created successfully');
});

const getOrderPayments = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const { orderId } = req.params;

  if (!orderId) {
    responseHandler.error(res, 400, 'Order ID is required');
    return;
  }

  // Validate order ownership
  await orderService.validateOrderOwnership(orderId, req.user.id);

  // Get payment by order using service
  const payment = await paymentService.getPaymentByOrder(orderId);

  if (!payment) {
    responseHandler.success(res, 200, { payment: null }, 'No payment found for this order');
    return;
  }

  responseHandler.success(res, 200, { payment }, 'Payment retrieved successfully');
});

const getPaymentById = catchAsync(async (req, res) => {
  const { paymentId } = req.params;

  if (!paymentId) {
    responseHandler.error(res, 400, 'Payment ID is required');
    return;
  }

  // Get payment details using service
  const payment = await paymentService.getPaymentDetails(paymentId);

  if (!payment) {
    responseHandler.error(res, 404, 'Payment not found');
    return;
  }

  responseHandler.success(res, 200, { payment }, 'Payment retrieved successfully');
});

const verifyPayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params;

  if (!paymentId) {
    responseHandler.error(res, 400, 'Payment ID is required');
    return;
  }

  // Update payment status using service
  const payment = await paymentService.updatePaymentStatus(paymentId, 'paid');

  responseHandler.success(res, 200, { payment }, 'Payment verified successfully');
});

const updatePaymentStatus = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const { status } = req.body;
  const { authorizedBy } = req.user; // Admin who authorized

  if (!paymentId) {
    responseHandler.error(res, 400, 'Payment ID is required');
    return;
  }

  if (!status) {
    responseHandler.error(res, 400, 'Payment status is required');
    return;
  }

  // Update payment status using service
  const payment = await paymentService.updatePaymentStatus(paymentId, status, {
    authorizedBy: req.user.id,
  });

  responseHandler.success(res, 200, { payment }, 'Payment status updated successfully');
});

module.exports = {
  createPayment,
  getOrderPayments,
  getPaymentById,
  verifyPayment,
  updatePaymentStatus,
};