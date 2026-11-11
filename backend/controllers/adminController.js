const catchAsync = require('../src/utils/catchAsync');
const responseHandler = require('../src/utils/responseHandler');
const adminService = require('../src/services/adminService');
const AppError = require('../src/utils/errors').AppError;
const ForbiddenError = require('../src/utils/errors').ForbiddenError;

// Admin-only middleware will be applied in routes
// These controllers assume admin authentication has been verified

const getDashboardStats = catchAsync(async (req, res) => {
  // Admin-only access enforced by middleware
  const stats = await adminService.getDashboardStats();

  responseHandler.success(res, 200, stats, 'Dashboard statistics retrieved successfully');
});

const getSalesReport = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    responseHandler.error(res, 400, 'Start and end dates are required');
    return;
  }

  // Sales report will be integrated with admin service in later phase
  responseHandler.success(res, 200, {
    startDate,
    endDate,
    sales: [],
    totalSales: 0,
  }, 'Sales report retrieved successfully');
});

const getCustomerList = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, role } = req.query;

  // Customer list will be integrated with admin service in later phase
  const customers = await adminService.getCustomerLists({
    page: Number(page),
    limit: Number(limit),
    role,
  });

  responseHandler.success(res, 200, customers, 'Customer list retrieved successfully');
});

const getLowStockProducts = catchAsync(async (req, res) => {
  const { threshold = 10 } = req.query;

  // Low-stock products will be integrated with admin service in later phase
  const products = await adminService.getLowStockProducts(threshold);

  responseHandler.success(res, 200, { products }, 'Low-stock products retrieved successfully');
});

const getBestSellingProducts = catchAsync(async (req, res) => {
  const { limit = 10 } = req.query;

  // Best-selling products will be integrated with admin service in later phase
  const products = await adminService.getBestSellingProducts(limit);

  responseHandler.success(res, 200, { products }, 'Best-selling products retrieved successfully');
});

const getRecentOrders = catchAsync(async (req, res) => {
  const { limit = 10 } = req.query;

  // Recent orders will be integrated with admin service in later phase
  const orders = await adminService.getRecentOrders({ limit: Number(limit) });

  // Return the paginated result directly so `data.orders` is the array.
  responseHandler.success(res, 200, orders, 'Recent orders retrieved successfully');
});

module.exports = {
  getDashboardStats,
  getSalesReport,
  getCustomerList,
  getLowStockProducts,
  getBestSellingProducts,
  getRecentOrders,
};