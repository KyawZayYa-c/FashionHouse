const catchAsync = require('../../utils/catchAsync');
const responseHandler = require('../../utils/responseHandler');
const categoryService = require('../services/categoryService'); // Will be integrated in later phase
const AppError = require('../../utils/errors').AppError;
const NotFoundError = require('../../utils/errors').NotFoundError;

const createCategory = catchAsync(async (req, res) => {
  const { categoryName, slug, description } = req.body;

  if (!categoryName) {
    responseHandler.error(res, 400, 'Category name is required');
    return;
  }

  // Category creation will be integrated with category service in later phase
  responseHandler.success(res, 201, { category: { categoryName, slug } }, 'Category created successfully');
});

const getCategories = catchAsync(async (req, res) => {
  const { status } = req.query;

  // Categories retrieval will be integrated with category service in later phase
  const filters = status ? { status } : {};
  responseHandler.success(res, 200, { categories: [], filters }, 'Categories retrieved successfully');
});

const getCategoryById = catchAsync(async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    responseHandler.error(res, 400, 'Category ID is required');
    return;
  }

  // Category retrieval by ID will be integrated with category service in later phase
  responseHandler.success(res, 200, { category: {} }, 'Category retrieved successfully');
});

const updateCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const { categoryName, slug, description, status } = req.body;

  if (!categoryId) {
    responseHandler.error(res, 400, 'Category ID is required');
    return;
  }

  // Category update will be integrated with category service in later phase
  responseHandler.success(res, 200, { categoryId }, 'Category updated successfully');
});

const deleteCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    responseHandler.error(res, 400, 'Category ID is required');
    return;
  }

  // Category deletion will be integrated with category service in later phase
  responseHandler.success(res, 200, { categoryId }, 'Category deleted successfully');
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};