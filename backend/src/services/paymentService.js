const Payment = require('../models/Payment');
const Order = require('../models/Order');
const AppError = require('../utils/errors').AppError;
const NotFoundError = require('../utils/errors').NotFoundError;
const ConflictError = require('../utils/errors').ConflictError;
const ValidationError = require('../utils/errors').ValidationError;
const catchAsync = (fn) => fn;

/**
 * Create payment record
 * @param {Object} orderId - The order ID
 * @param {Object} paymentData - Payment method and amount
 * @returns {Promise<Object>} The created payment record
 */
const createPayment = catchAsync(async (orderId, paymentData) => {
  const { paymentMethod, amount, transactionReference } = paymentData;

  // Validate order exists
  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError('Order');
  }

  // Validate payment amount against order total
  const orderTotal = order.totalAmount || 0;
  if (amount && Number(amount) !== Number(orderTotal)) {
    throw new ValidationError(
      `Payment amount (${amount}) does not match order total (${orderTotal})`
    );
  }

  // Check for duplicate transaction reference
  if (transactionReference) {
    const existingPayment = await Payment.findOne({ transactionReference });
    if (existingPayment) {
      throw new ConflictError('Transaction reference already exists');
    }
  }

  const payment = await Payment.create({
    orderId,
    paymentMethod,
    amount: amount || orderTotal,
    paymentStatus: 'pending',
    transactionReference,
  });

  return payment;
});

/**
 * Get payment by order ID
 * @param {Object} orderId - The order ID
 * @returns {Promise<Object>} The payment record
 */
const getPaymentByOrder = catchAsync(async (orderId) => {
  // Validate order exists
  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError('Order');
  }

  const payment = await Payment.findOne({ orderId });

  if (!payment) {
    return null;
  }

  return payment;
});

/**
 * Get payment details
 * @param {Object} paymentId - The payment ID
 * @returns {Promise<Object>} The payment record
 */
const getPaymentDetails = catchAsync(async (paymentId) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new NotFoundError('Payment');
  }

  return payment;
});

/**
 * Update payment status - only for server-side verification or admin confirmation
 * @param {Object} paymentId - The payment ID
 * @param {Object} status - The new payment status
 * @param {Object} reason - Optional reason for the status change
 * @param {Object} authorizedBy - The ID of the authorizing admin (if applicable)
 * @returns {Promise<Object>} The updated payment
 */
const updatePaymentStatus = catchAsync(async (paymentId, status, options = {}) => {
  const { reason, authorizedBy } = options;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new NotFoundError('Payment');
  }

  // Only allow specific status transitions
  const validTransitions = {
    pending: ['paid', 'failed'],
    paid: ['refunded'],
    failed: ['pending'],
    refunded: ['pending'], // Can refund from paid state
  };

  // Check if the transition is valid
  if (validTransitions[payment.paymentStatus] && !validTransitions[payment.paymentStatus].includes(status)) {
    throw new ValidationError(`Invalid status transition from ${payment.paymentStatus} to ${status}`);
  }

  payment.paymentStatus = status;

  if (status === 'paid') {
    payment.paidAt = new Date();
    // Optionally update order payment status
    // await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: 'paid' });
  } else if (status === 'refunded') {
    payment.refundReason = reason;
    payment.refundedAt = new Date();
  }

  await payment.save();

  return payment;
});

/**
 * Handle failed payments
 * @param {Object} paymentId - The payment ID
 * @returns {Promise<Object>} The updated payment
 */
const handleFailedPayment = catchAsync(async (paymentId) => {
  const payment = await updatePaymentStatus(paymentId, 'failed');
  return payment;
});

/**
 * Handle successful payments
 * @param {Object} paymentId - The payment ID
 * @returns {Promise<Object>} The updated payment
 */
const handleSuccessfulPayment = catchAsync(async (paymentId) => {
  const payment = await updatePaymentStatus(paymentId, 'paid');
  return payment;
});

/**
 * Process refund
 * @param {Object} paymentId - The payment ID
 * @param {Object} options - Refund options (amount, reason)
 * @returns {Promise<Object>} The updated payment
 */
const processRefund = catchAsync(async (paymentId, options = {}) => {
  const { amount, reason } = options;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new NotFoundError('Payment');
  }

  if (payment.paymentStatus !== 'paid') {
    throw new ValidationError('Cannot refund a payment that is not in paid state');
  }

  // Validate refund amount against payment amount
  const refundAmount = amount ? Number(amount) : Number(payment.amount);
  const paymentAmount = Number(payment.amount);

  if (refundAmount > paymentAmount) {
    throw new ValidationError('Refund amount cannot exceed payment amount');
  }

  payment.paymentStatus = 'refunded';
  payment.refundReason = reason;
  payment.refundedAt = new Date();

  // Optionally adjust the remaining amount if partial refund
  if (refundAmount < paymentAmount) {
    // Keep partial amount logic for future implementation
  }

  await payment.save();

  return payment;
});

module.exports = {
  createPayment,
  getPaymentByOrder,
  getPaymentDetails,
  updatePaymentStatus,
  handleFailedPayment,
  handleSuccessfulPayment,
  processRefund,
};