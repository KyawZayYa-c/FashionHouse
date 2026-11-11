const Shipment = require('../models/Shipment');
const Order = require('../models/Order');
const AppError = require('../utils/errors').AppError;
const NotFoundError = require('../utils/errors').NotFoundError;
const ConflictError = require('../utils/errors').ConflictError;
const ValidationError = require('../utils/errors').ValidationError;
const catchAsync = (fn) => fn;

/**
 * Create shipment for an order
 * @param {Object} orderId - The order ID
 * @param {Object} shipmentData - Shipment details (courier, tracking number)
 * @returns {Promise<Object>} The created shipment
 */
const createShipment = catchAsync(async (orderId, shipmentData) => {
  const { courierName, trackingNumber } = shipmentData;

  // 1. Validate order existence and pending status
  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError('Order');
  }

  if (order.orderStatus === 'delivered' || order.orderStatus === 'returned') {
    throw new ValidationError(
      'Cannot create shipment for a delivered or returned order'
    );
  }

  if (order.orderStatus === 'shipped') {
    // If already shipped, check if shipment exists
    const existingShipment = await Shipment.findOne({ orderId });
    if (existingShipment) {
      throw new ValidationError('Shipment already exists for this order');
    }
  }

  // 2. Validate or generate tracking number
  let finalTrackingNumber = trackingNumber;
  if (!finalTrackingNumber) {
    // Generate a tracking number if not provided
    const prefix = 'FT';
    const randomSuffix = Math.random()
      .toString(36)
      .substr(2, 15)
      .toUpperCase();
    finalTrackingNumber = `${prefix}-${new Date().getTime()}-${randomSuffix}`;
  } else {
    // Check for duplicate tracking number
    const existingShipment = await Shipment.findOne({ trackingNumber: finalTrackingNumber });
    if (existingShipment) {
      throw new ConflictError('Tracking number already exists');
    }
  }

  // 3. Create shipment
  const shipment = await Shipment.create({
    orderId,
    courierName,
    trackingNumber: finalTrackingNumber,
    shipmentStatus: 'preparing',
  });

  // 4. Update order status to shipped
  await Order.findByIdAndUpdate(orderId, {
    orderStatus: 'shipped',
  });

  return shipment;
});

/**
 * Get shipment by order ID
 * @param {Object} orderId - The order ID
 * @returns {Promise<Object>} The shipment
 */
const getShipmentByOrder = catchAsync(async (orderId) => {
  const shipment = await Shipment.findOne({ orderId });

  if (!shipment) {
    return null;
  }

  return shipment;
});

/**
 * Get shipment by tracking number
 * @param {String} trackingNumber - The tracking number
 * @returns {Promise<Object>} The shipment
 */
const getShipmentByTrackingNumber = catchAsync(async (trackingNumber) => {
  const shipment = await Shipment.findOne({ trackingNumber });

  if (!shipment) {
    throw new NotFoundError('Shipment');
  }

  return shipment;
});

/**
 * Update shipment status
 * @param {Object} shipmentId - The shipment ID
 * @param {Object} status - The new shipment status
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} The updated shipment
 */
const updateShipmentStatus = catchAsync(async (shipmentId, status, options = {}) => {
  const { authorizedBy } = options;

  const shipment = await Shipment.findById(shipmentId);
  if (!shipment) {
    throw new NotFoundError('Shipment');
  }

  // Validate status transition
  const validStatuses = [
    'preparing',
    'shipped',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'failed',
    'returned',
  ];

  if (!validStatuses.includes(status)) {
    throw new ValidationError(`Invalid shipment status. Must be one of: ${validStatuses.join(', ')}`);
  }

  // Prevent moving backwards unless it's a return
  const statusOrder = [
    'preparing',
    'shipped',
    'in_transit',
    'out_for_delivery',
    'delivered',
  ];

  const currentIndex = statusOrder.indexOf(shipment.shipmentStatus);
  const newIndex = statusOrder.indexOf(status);

  // Allow moving forward always, or moving to 'returned' from any state
  if (newIndex !== undefined && currentIndex !== undefined && newIndex < currentIndex && status !== 'returned') {
    throw new ValidationError('Cannot move shipment status backwards');
  }

  shipment.shipmentStatus = status;

  // Add tracking history entry
  const location = options.location;
  const description = options.description;
  if (location || description) {
    // Add tracking history
    shipment.trackingHistory.push({
      status,
      location: location || '',
      description: description || '',
      timestamp: new Date(),
    });
  }

  // Synchronize order status when appropriate
  if (status === 'delivered') {
    await Order.findByIdAndUpdate(shipment.orderId, {
      orderStatus: 'delivered',
      paymentStatus: 'paid',
    });
  } else if (status === 'returned') {
    await Order.findByIdAndUpdate(shipment.orderId, {
      orderStatus: 'returned',
    });
  }

  await shipment.save();

  return shipment;
});

/**
 * Add tracking history entry
 * @param {Object} shipmentId - The shipment ID
 * @param {Object} trackingData - Tracking history data
 * @returns {Promise<Object>} The updated shipment
 */
const addTrackingHistory = catchAsync(async (shipmentId, trackingData) => {
  const { status, location, description } = trackingData;

  const shipment = await Shipment.findById(shipmentId);
  if (!shipment) {
    throw new NotFoundError('Shipment');
  }

  shipment.trackingHistory.push({
    status,
    location: location || '',
    description: description || '',
    timestamp: new Date(),
  });

  await shipment.save();

  return shipment;
});

/**
 * Get customer tracking information
 * @param {Object} userId - The user ID
 * @returns {Promise<Array>} Array of orders with shipment information
 */
const getCustomerTrackingInformation = catchAsync(async (userId) => {
  // Get all orders for the user with shipment info
  const ordersWithShipments = await Order.aggregate([
    { $match: { userId } },
    {
      $lookup: {
        from: 'shipments',
        localField: '_id',
        foreignField: 'orderId',
        as: 'shipment',
      },
    },
    { $unwind: '$shipment', preserveNullAndEmptyArrays: true },
    {
      $project: {
        orderNumber: 1,
        orderStatus: 1,
        shipmentStatus: '$shipment.shipmentStatus',
        trackingNumber: '$shipment.trackingNumber',
        trackingHistory: '$shipment.trackingHistory',
        createdAt: 1,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  return ordersWithShipments;
});

module.exports = {
  createShipment,
  getShipmentByOrder,
  getShipmentByTrackingNumber,
  updateShipmentStatus,
  addTrackingHistory,
  getCustomerTrackingInformation,
};