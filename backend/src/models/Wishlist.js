const mongoose = require('mongoose')
const { Schema } = mongoose

const wishlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
  },
  {
    timestamps: true,
  }
)

// Compound unique index to prevent adding same product multiple times
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true })

// Method to check if product is already in wishlist
wishlistSchema.statics.isProductInWishlist = async function (userId, productId) {
  const existing = await this.findOne({ userId, productId })
  return !!existing
}

const Wishlist = mongoose.model('Wishlist', wishlistSchema)

module.exports = Wishlist