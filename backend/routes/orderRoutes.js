const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const orderController = require('../controllers/orderController');

// Customer routes (require authentication)

router.post('/', authMiddleware, orderController.createOrder);

router.get('/my-orders', authMiddleware, orderController.getMyOrders);

router.get('/my-orders/:id', authMiddleware, orderController.getMyOrderById);

router.get('/:id', authMiddleware, orderController.getOrderById);

router.put('/:id/cancel', authMiddleware, orderController.cancelOrder);

// Admin-only routes

router.get('/admin/all', authMiddleware, adminMiddleware, orderController.getAllOrders);

router.put('/admin/:id/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);

module.exports = router;