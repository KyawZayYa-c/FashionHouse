const express = require('express');
const router = express.Router();
const authMiddleware = require('../src/utils/middleware/authMiddleware');
const adminMiddleware = require('../src/utils/middleware/adminMiddleware');
const paymentController = require('../controllers/paymentController');

// Customer routes (require authentication)

router.post('/', authMiddleware, paymentController.createPayment);

router.get('/order/:orderId', authMiddleware, paymentController.getOrderPayments);

router.get('/:id', authMiddleware, paymentController.getPaymentById);

// Admin-only routes

router.put('/:id/verify', authMiddleware, adminMiddleware, paymentController.updatePaymentStatus);

module.exports = router;