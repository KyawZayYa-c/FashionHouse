const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminRouter');

// All admin routes require authentication AND admin role

router.get('/dashboard', authMiddleware, adminMiddleware, adminController.getDashboardStats);

router.get('/sales', authMiddleware, adminMiddleware, adminController.getSalesReport);

router.get('/customers', authMiddleware, adminMiddleware, adminController.getCustomerList);

router.get('/low-stock', authMiddleware, adminMiddleware, adminController.getLowStockProducts);

router.get('/best-selling', authMiddleware, adminMiddleware, adminController.getBestSellingProducts);

router.get('/recent-orders', authMiddleware, adminMiddleware, adminController.getRecentOrders);

module.exports = router;