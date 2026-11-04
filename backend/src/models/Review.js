const mongoose = require('mongoose')
const { Schema } = mongoose

const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    reviewText: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
reviewSchema.index({ userId: 1 })
reviewSchema.index({ productId: 1 })
reviewSchema.index({ productId: 1, createdAt: -1 })

// Compound unique index to prevent duplicate reviews by same user for same product and order
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true })

// Method to check if rating is valid
reviewSchema.methods.isValidRating = function () {
  return this.rating >= 1 && this.rating <= 5
}

// Static to find reviews by product
reviewSchema.statics.findByProduct = function (productId) {
  return this.find({ productId }).sort({ createdAt: -1 })
}

// Static to find reviews by user
reviewSchema.statics.findByUser = function (userId) {
  return this.find({ userId }).sort({ createdAt: -1 })
}

// Static to find verified purchase reviews
reviewSchema.statics.findVerifiedPurchases = function (productId, userId) {
  return this.find({
    productId,
    userId,
    orderId: { $exists: true },
  })
}

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review