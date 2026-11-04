const mongoose = require('mongoose')
const { Schema, model } = mongoose

// Image schema embedded in Product
const imageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
)

// Validate that only one image is marked as primary per product
imageSchema.statics.isPrimaryImage = async function (images) {
  const primaryCount = images.filter((img) => img.isPrimary).length
  return primaryCount <= 1
}

// Variant schema embedded in Product
const variantSchema = new Schema(
  {
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock must be at least 0'],
      default: 0,
    },
    additionalPrice: {
      type: Schema.Types.Decimal128,
      default: 0,
    },
  },
  { _id: true }
)

// Validate that variant SKU values are unique within the same product
variantSchema.statics.hasDuplicateSKU = function (variants) {
  const skus = variants.map((v) => v.sku)
  return new Set(skus).size !== skus.length
}

const productSchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    price: {
      type: Schema.Types.Decimal128,
      required: true,
      min: [0, 'Price must be at least 0'],
    },
    variants: [variantSchema],
    images: [imageSchema],
    status: {
      type: String,
      enum: ['active', 'inactive', 'out_of_stock'],
      default: 'active',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
productSchema.index({ slug: 1 }, { unique: true })
productSchema.index({ categoryId: 1 })
productSchema.index({ status: 1, createdAt: -1 })
productSchema.index({ 'variants.sku': 1 })

// Virtual for full product name with brand
productSchema.virtual('fullName').get(function () {
  return this.brand ? `${this.brand} ${this.productName}` : this.productName
})

// Method to get variants by size
productSchema.methods.getVariantsBySize = function (size) {
  return this.variants.filter((v) => v.size === size)
}

// Method to get variants by color
productSchema.methods.getVariantsByColor = function (color) {
  return this.variants.filter((v) => v.color === color)
}

// Method to check if SKU exists
productSchema.statics.isSKUExists = async function (productId, sku) {
  const product = await this.findById(productId)
  if (!product) return false
  return product.variants.some((v) => v.sku === sku)
}

// Static to find featured products
productSchema.statics.findFeatured = function (filter = {}) {
  return this.find({ isFeatured: true, ...filter }).limit(8)
}

// Static to find products by category
productSchema.statics.findByCategory = function (categoryId) {
  return this.find({ categoryId, status: 'active' })
}

// Static to search products
productSchema.statics.searchProducts = function (query) {
  return this.find({
    $or: [
      { productName: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ],
    status: 'active',
  })
}

// Helper method to get product without sensitive data
productSchema.methods.toJSON = function () {
  const product = this
  const productObject = product.toObject()
  return productObject
}

const Product = model('Product', productSchema)

module.exports = Product