const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const AppError = require('../utils/errors').AppError;
const NotFoundError = require('../utils/errors').NotFoundError;
const ValidationError = require('../utils/errors').ValidationError;
// Service functions are plain async functions, not Express handlers. Errors
// thrown here propagate to the calling controller's catchAsync wrapper.
const catchAsync = (fn) => fn;

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} Dashboard statistics
 */
const getDashboardStats = catchAsync(async () => {
  // Use aggregation for efficient computation
  const stats = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSales: {
          $sum: '$totalAmount',
        },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$orderStatus', 'pending'] }, 1, 0] },
        },
        confirmedOrders: {
          $sum: { $cond: [{ $eq: ['$orderStatus', 'confirmed'] }, 1, 0] },
        },
        shippedOrders: {
          $sum: { $cond: [{ $eq: ['$orderStatus', 'shipped'] }, 1, 0] },
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] },
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0] },
        },
      },
    },
  ]);

  const orderStats = stats.length > 0 ? stats[0] : {
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  };

  // Get product stats
  const productStats = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
        },
        inactiveProducts: {
          $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] },
        },
      },
    },
  ]);

  const productStatsResult = productStats.length > 0 ? productStats[0] : {
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
  };

  // Get category stats
  const Category = require('../models/Category');
  const categoryStats = await Category.aggregate([
    {
      $group: {
        _id: null,
        totalCategories: { $sum: 1 },
        activeCategories: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
        },
      },
    },
  ]);

  const categoryStatsResult = categoryStats.length > 0 ? categoryStats[0] : {
    totalCategories: 0,
    activeCategories: 0,
  };

  // Get customer count
  const customerCount = await User.countDocuments({ role: 'customer', isActive: true });

  return {
    orderStats,
    productStats: productStatsResult,
    categoryStats: categoryStatsResult,
    totalCustomers: customerCount,
  };
});

/**
 * Get total customers
 * @returns {Promise<number>} Total customer count
 */
const getTotalCustomers = catchAsync(async () => {
  return await User.countDocuments({ role: 'customer', isActive: true });
});

/**
 * Get total products
 * @returns {Promise<number>} Total product count
 */
const getTotalProducts = catchAsync(async () => {
  return await Product.countDocuments({ status: 'active' });
});

/**
 * Get total categories
 * @returns {Promise<number>} Total category count
 */
const getTotalCategories = catchAsync(async () => {
  const Category = require('../models/Category');
  return await Category.countDocuments({ status: 'active' });
});

/**
 * Get total orders
 * @returns {Promise<number>} Total order count
 */
const getTotalOrders = catchAsync(async () => {
  return await Order.countDocuments();
});

/**
 * Get total sales amount
 * @returns {Promise<number>} Total sales amount
 */
const getTotalSales = catchAsync(async () => {
  const result = await Order.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: '$totalAmount' },
      },
    },
  ]);

  return result.length > 0 ? Number(result[0].total) : 0;
});

/**
 * Get pending orders
 * @param {Object} query - Pagination and filter options
 * @returns {Promise<Object>} Pending orders
 */
const getPendingOrders = catchAsync(async (query = {}) => {
  const { page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ orderStatus: 'pending' })
    .populate('userId', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Order.countDocuments({ orderStatus: 'pending' });

  return {
    orders,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
    total,
  };
});

/**
 * Get recent orders
 * @param {Object} query - Pagination options
 * @returns {Promise<Object>} Recent orders
 */
const getRecentOrders = catchAsync(async (query = {}) => {
  const { page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const orders = await Order.find()
    .populate('userId', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Order.countDocuments();

  return {
    orders,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
    total,
  };
});

/**
 * Get low-stock products
 * @param {number} threshold - Stock threshold (default: 10)
 * @returns {Promise<Array>} Low-stock products
 */
const getLowStockProducts = catchAsync(async (threshold = 10) => {
  const products = await Product.find({
    'variants.stock': { $lte: threshold },
  })
    .select('productName slug brand variants.price variants.stock')
    .sort({ 'variants.stock': 1 });

  return products;
});

/**
 * Get best-selling products
 * @param {number} limit - Maximum number of products to return (default: 10)
 * @returns {Promise<Array>} Best-selling products
 */
const getBestSellingProducts = catchAsync(async (limit = 10) => {
  const products = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        totalSold: { $sum: '$items.quantity' },
        lastSold: { $max: '$createdAt' },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $project: {
        productId: '$_id',
        productName: '$product.productName',
        brand: '$product.brand',
        totalSold: 1,
        lastSold: 1,
      },
    },
  ]);

  return products;
});

/**
 * Get sales summaries by date range

/**
 * Get sales summaries by date range
 * @param {Object} dateRange - Start and end dates
 * @returns {Promise<Object>} Sales summary
 */
const getSalesSummaryByDateRange = catchAsync(async (dateRange) => {
  const { startDate, endDate } = dateRange;

  if (!startDate || !endDate) {
    throw new ValidationError('Start and end dates are required');
  }

  const salesSummary = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        totalOrders: { $sum: 1 },
        totalSales: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  return salesSummary;
});

/**
 * Get customer lists with pagination
 * @param {Object} query - Pagination and filter options
 * @returns {Promise<Object>} Customer list
 */
const getCustomerLists = catchAsync(async (query = {}) => {
  const { page = 1, limit = 10, role } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (role) {
    filter.role = role;
  }

  const customers = await User.find(filter)
    .select('username email role isActive createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await User.countDocuments(filter);

  return {
    customers,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
    total,
  };
});

/**
 * Get all orders with filters
 * @param {Object} filter - Filter options (status, userId, date range)
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Orders with filters
 */
const getAllOrdersWithFilters = catchAsync(async (filter = {}, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;

  // Build the query with populated user info
  const orders = await Order.find(filter)
    .populate('userId', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Order.countDocuments(filter);

  return {
    orders,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
    total,
  };
});

/**
 * Manage product stock
 * @param {Object} productId - The product ID
 * @param {Object} stockData - Stock adjustment data
 * @param {Object} operation - 'add' or 'set'
 * @returns {Promise<Object>} The updated product
 */
const manageProductStock = catchAsync(async (productId, stockData, operation = 'add') => {
  const { quantity } = stockData;

  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError('Product');
  }

  if (operation === 'add') {
    // Add quantity to existing stock
    product.variants.forEach((variant) => {
      if (variant._id.toString() in stockData) {
        // This is a simplified approach - in production, validate variant IDs
        variant.stock += quantity || 0;
      }
    });
  } else if (operation === 'set') {
    // Set stock to specific quantity
    if (quantity !== undefined && quantity >= 0) {
      product.variants.forEach((variant) => {
        variant.stock = quantity;
      });
    }
  }

  await product.save();

  return product;
});

module.exports = {
  getDashboardStats,
  getTotalCustomers,
  getTotalProducts,
  getTotalCategories,
  getTotalOrders,
  getTotalSales,
  getPendingOrders,
  getRecentOrders,
  getLowStockProducts,
  getBestSellingProducts,
  getSalesSummaryByDateRange,
  getCustomerLists,
  getAllOrdersWithFilters,
  manageProductStock,
};