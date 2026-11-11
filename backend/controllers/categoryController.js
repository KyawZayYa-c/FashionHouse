const catchAsync = require('../src/utils/catchAsync');
const responseHandler = require('../src/utils/responseHandler');
const Category = require('../src/models/Category');
const AppError = require('../src/utils/errors').AppError;
const NotFoundError = require('../src/utils/errors').NotFoundError;
const ValidationError = require('../src/utils/errors').ValidationError;

// Create category
const createCategory = catchAsync(async (req, res) => {
  const { categoryName, slug, description } = req.body;

  if (!categoryName) {
    responseHandler.error(res, 400, 'Category name is required');
    return;
  }

  // Check if category already exists (by name or slug)
  const existingCategory = await Category.findOne({
    $or: [{ categoryName: { $regex: new RegExp(`^${categoryName}$`, 'i') } }, { slug: slug.toLowerCase() }]
  });

  if (existingCategory) {
    if (existingCategory.categoryName.toLowerCase() === categoryName.toLowerCase()) {
      responseHandler.error(res, 409, 'Category name already exists');
      return;
    }
    responseHandler.error(res, 409, 'Slug already exists');
    return;
  }

  const category = new Category({
    categoryName,
    slug: slug.toLowerCase(),
    description,
    status: 'active',
  });

  await category.save();

  responseHandler.success(res, 201, { category }, 'Category created successfully');
});

// Get all categories
const getCategories = catchAsync(async (req, res) => {
  const { status } = req.query;

  const filter = {};
  if (status) {
    filter.status = status;
  }

  const categories = await Category.find(filter).sort({ categoryName: 1 });

  responseHandler.success(res, 200, { categories }, 'Categories retrieved successfully');
});

// Get category by ID
const getCategoryById = catchAsync(async (req, res) => {
  const categoryId = req.params.categoryId || req.params.id;

  if (!categoryId) {
    responseHandler.error(res, 400, 'Category ID is required');
    return;
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    responseHandler.error(res, 404, 'Category not found');
    return;
  }

  responseHandler.success(res, 200, { category }, 'Category retrieved successfully');
});

// Update category
const updateCategory = catchAsync(async (req, res) => {
  const categoryId = req.params.categoryId || req.params.id;
  const { categoryName, slug, description, status } = req.body;

  if (!categoryId) {
    responseHandler.error(res, 400, 'Category ID is required');
    return;
  }

  // Check if slug is already taken (excluding current category)
  if (slug) {
    const existingCategory = await Category.findOne({
      slug: slug.toLowerCase(),
      _id: { $ne: categoryId }
    });

    if (existingCategory) {
      responseHandler.error(res, 409, 'Slug already exists');
      return;
    }
  }

  // Update category
  const updateData = {};
  if (categoryName) updateData.categoryName = categoryName;
  if (slug) updateData.slug = slug.toLowerCase();
  if (description) updateData.description = description;
  if (status) updateData.status = status;

  const category = await Category.findByIdAndUpdate(categoryId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    responseHandler.error(res, 404, 'Category not found');
    return;
  }

  responseHandler.success(res, 200, { category }, 'Category updated successfully');
});

// Delete category
const deleteCategory = catchAsync(async (req, res) => {
  const categoryId = req.params.categoryId || req.params.id;

  if (!categoryId) {
    responseHandler.error(res, 400, 'Category ID is required');
    return;
  }

  const category = await Category.findByIdAndDelete(categoryId);

  if (!category) {
    responseHandler.error(res, 404, 'Category not found');
    return;
  }

  responseHandler.success(res, 200, { categoryId }, 'Category deleted successfully');
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};