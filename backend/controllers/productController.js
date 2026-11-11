const catchAsync = require('../src/utils/catchAsync');
const responseHandler = require('../src/utils/responseHandler');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
const AppError = require('../src/utils/errors').AppError;
const NotFoundError = require('../src/utils/errors').NotFoundError;
const ValidationError = require('../src/utils/errors').ValidationError;

// Create product
const createProduct = catchAsync(async (req, res) => {
  const {
    categoryId,
    productName,
    slug,
    description,
    brand,
    price,
    variants,
    images,
    status,
    isFeatured,
  } = req.body;

  if (!productName || !slug || !price) {
    responseHandler.error(res, 400, 'Product name, slug, and price are required');
    return;
  }

  // Check if product already exists (by slug)
  const existingProduct = await Product.findOne({ slug });
  if (existingProduct) {
    responseHandler.error(res, 409, 'Product slug already exists');
    return;
  }

  // Validate category exists (if provided)
  let category = null;
  if (categoryId) {
    category = await Category.findById(categoryId);
    if (!category) {
      responseHandler.error(res, 400, 'Invalid category ID');
      return;
    }
  }

  // Accept variants/images as either a JSON array or a JSON-encoded string.
  let parsedVariants = [];
  if (Array.isArray(variants)) {
    parsedVariants = variants;
  } else if (typeof variants === 'string' && variants.trim()) {
    try {
      parsedVariants = JSON.parse(variants);
    } catch (e) {
      responseHandler.error(res, 400, 'Invalid variants format');
      return;
    }
  }

  // Parse images if provided
  let parsedImages = [];
  if (Array.isArray(images)) {
    parsedImages = images;
  } else if (typeof images === 'string' && images.trim()) {
    try {
      parsedImages = JSON.parse(images);
    } catch (e) {
      responseHandler.error(res, 400, 'Invalid images format');
      return;
    }
  }

  // Set default status if not provided
  const productStatus = status || 'active';

  // Set default isFeatured if not provided
  const productIsFeatured = isFeatured || false;

  const product = new Product({
    categoryId: categoryId || undefined,
    productName,
    slug: slug.toLowerCase(),
    description: description || '',
    brand: brand || '',
    price: Number(price),
    variants: parsedVariants || [],
    images: parsedImages || [],
    status: productStatus,
    isFeatured: productIsFeatured,
  });

  await product.save();

  responseHandler.success(res, 201, { product }, 'Product created successfully');
});

// Get all products with pagination and filtering
const getProducts = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, categoryId, isFeatured, sort } = req.query;

  // Build filter object
  const filter = {};
  if (status) filter.status = status;
  if (categoryId) filter.categoryId = categoryId;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

  // Build sort object
  const sortOptions = {};
  if (sort) {
    const [field, direction] = sort.split(':');
    sortOptions[field] = direction === 'desc' ? -1 : 1;
  } else {
    sortOptions.createdAt = -1;
  }

  // Parse pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Fetch products with pagination
  const products = await Product.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  // Count total documents
  const totalProducts = await Product.countDocuments(filter);

  responseHandler.success(res, 200, {
    products,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(totalProducts / limitNum),
    totalProducts,
  }, 'Products retrieved successfully');
});

// Get product by ID
const getProductById = catchAsync(async (req, res) => {
  const productId = req.params.productId || req.params.id;

  if (!productId) {
    responseHandler.error(res, 400, 'Product ID is required');
    return;
  }

  const product = await Product.findById(productId)
    .populate('categoryId', 'categoryName slug');

  if (!product) {
    responseHandler.error(res, 404, 'Product not found');
    return;
  }

  responseHandler.success(res, 200, { product }, 'Product retrieved successfully');
});

// Get product by slug
const getProductBySlug = catchAsync(async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    responseHandler.error(res, 400, 'Product slug is required');
    return;
  }

  const product = await Product.findOne({ slug: slug.toLowerCase() });

  if (!product) {
    responseHandler.error(res, 404, 'Product not found');
    return;
  }

  responseHandler.success(res, 200, { product }, 'Product retrieved by slug successfully');
});

// Update product
const updateProduct = catchAsync(async (req, res) => {
  const productId = req.params.productId || req.params.id;

  if (!productId) {
    responseHandler.error(res, 400, 'Product ID is required');
    return;
  }

  const {
    categoryId,
    productName,
    slug,
    description,
    brand,
    price,
    variants,
    images,
    status,
    isFeatured,
  } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    responseHandler.error(res, 404, 'Product not found');
    return;
  }

  // Check if new slug is already taken (excluding current product)
  if (slug && slug !== product.slug) {
    const existingProduct = await Product.findOne({ slug: slug.toLowerCase(), _id: { $ne: productId } });
    if (existingProduct) {
      responseHandler.error(res, 409, 'Product slug already exists');
      return;
    }
  }

  // Update product fields
  if (categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      responseHandler.error(res, 400, 'Invalid category ID');
      return;
    }
    product.categoryId = categoryId;
  }
  if (productName) product.productName = productName;
  if (slug) product.slug = slug.toLowerCase();
  if (description !== undefined) product.description = description;
  if (brand) product.brand = brand;
  if (price !== undefined) product.price = Number(price);
  if (variants !== undefined) {
    if (Array.isArray(variants)) {
      product.variants = variants;
    } else if (typeof variants === 'string') {
      try {
        product.variants = JSON.parse(variants);
      } catch (e) {
        responseHandler.error(res, 400, 'Invalid variants format');
        return;
      }
    }
  }
  if (images !== undefined) {
    if (Array.isArray(images)) {
      product.images = images;
    } else if (typeof images === 'string') {
      try {
        product.images = JSON.parse(images);
      } catch (e) {
        responseHandler.error(res, 400, 'Invalid images format');
        return;
      }
    }
  }
  if (status !== undefined) product.status = status;
  if (isFeatured !== undefined) product.isFeatured = isFeatured;

  await product.save();

  responseHandler.success(res, 200, { product }, 'Product updated successfully');
});

// Delete product (soft delete by changing status)
const deleteProduct = catchAsync(async (req, res) => {
  const productId = req.params.productId || req.params.id;

  if (!productId) {
    responseHandler.error(res, 400, 'Product ID is required');
    return;
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    { status: 'inactive' },
    { new: true }
  );

  if (!product) {
    responseHandler.error(res, 404, 'Product not found');
    return;
  }

  responseHandler.success(res, 200, { productId }, 'Product deactivated successfully');
});

// Get featured products
const getFeaturedProducts = catchAsync(async (req, res) => {
  const { limit = 8 } = req.query;

  const products = await Product.find({ isFeatured: true, status: 'active' })
    .limit(parseInt(limit, 10))
    .sort({ createdAt: -1 });

  responseHandler.success(res, 200, { products }, 'Featured products retrieved successfully');
});

// Search products
const searchProducts = catchAsync(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    responseHandler.error(res, 400, 'Search query is required');
    return;
  }

  const products = await Product.find({
    $or: [
      { productName: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ],
    status: 'active',
  }).limit(20);

  responseHandler.success(res, 200, {
    products,
    query,
    totalResults: products.length,
  }, 'Products searched successfully');
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  searchProducts,
};