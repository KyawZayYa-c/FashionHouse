const catchAsync = require('../src/utils/catchAsync');
const responseHandler = require('../src/utils/responseHandler');
const shipmentService = require('../src/services/shipmentService');
const orderService = require('../src/services/orderService');
const AppError = require('../src/utils/errors').AppError;
const NotFoundError = require('../src/utils/errors').NotFoundError;

const createShipment = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const { orderId, courierName, trackingNumber } = req.body;

  if (!orderId) {
    responseHandler.error(res, 400, 'Order ID is required');
    return;
  }

  // Admin-only route: no customer ownership check here (an admin ships any
  // order). The service validates that the order exists and is shippable.

  // Create shipment using service
  const shipment = await shipmentService.createShipment(orderId, {
    courierName,
    trackingNumber,
  });

  responseHandler.success(res, 201, { shipment }, 'Shipment created successfully');
});

const getShipmentByOrder = catchAsync(async (req, res) => {
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

  // Get shipment by order using service
  const shipment = await shipmentService.getShipmentByOrder(orderId);

  if (!shipment) {
    responseHandler.success(res, 200, { shipment: null }, 'No shipment found for this order');
    return;
  }

  responseHandler.success(res, 200, { shipment }, 'Shipment retrieved successfully');
});

const trackShipment = catchAsync(async (req, res) => {
  const { trackingNumber } = req.params;

  if (!trackingNumber) {
    responseHandler.error(res, 400, 'Tracking number is required');
    return;
  }

  // Get shipment by tracking number using service
  const shipment = await shipmentService.getShipmentByTrackingNumber(trackingNumber);

  if (!shipment) {
    responseHandler.error(res, 404, 'Shipment not found');
    return;
  }

  responseHandler.success(res, 200, { shipment }, 'Shipment tracked successfully');
});

const updateShipment = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  // Route declares ':id'; fall back from ':shipmentId' for safety.
  const shipmentId = req.params.shipmentId || req.params.id;
  const { status, location, description } = req.body;

  if (!shipmentId) {
    responseHandler.error(res, 400, 'Shipment ID is required');
    return;
  }

  // Update shipment status using service
  const shipment = await shipmentService.updateShipmentStatus(shipmentId, status, {
    location,
    description,
  });

  responseHandler.success(res, 200, { shipment }, 'Shipment updated successfully');
});

const addTrackingHistory = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  // Route declares ':id'; fall back from ':shipmentId' for safety.
  const shipmentId = req.params.shipmentId || req.params.id;
  const { status, location, description } = req.body;

  if (!shipmentId) {
    responseHandler.error(res, 400, 'Shipment ID is required');
    return;
  }

  // Add tracking history using service
  const shipment = await shipmentService.addTrackingHistory(shipmentId, {
    status,
    location,
    description,
  });

  responseHandler.success(res, 200, { shipment }, 'Tracking history added successfully');
});

module.exports = {
  createShipment,
  getShipmentByOrder,
  trackShipment,
  updateShipment,
  addTrackingHistory,
};