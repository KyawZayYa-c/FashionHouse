const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const shipmentController = require('../controllers/shipmentController');

// Customer routes (require authentication)

router.get('/track/:trackingNumber', authMiddleware, shipmentController.trackShipment);

router.get('/order/:orderId', authMiddleware, shipmentController.getShipmentByOrder);

// Admin-only routes

router.post('/', authMiddleware, adminMiddleware, shipmentController.createShipment);

router.put('/:id', authMiddleware, adminMiddleware, shipmentController.updateShipment);

router.post('/:id/tracking', authMiddleware, adminMiddleware, shipmentController.addTrackingHistory);

module.exports = router;