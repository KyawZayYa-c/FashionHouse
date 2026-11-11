const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { generateAccessToken } = require('../utils/jwtToken')
const { Schema } = mongoose

const addressSchema = new Schema(
  {
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    township: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
)

// Virtual for full address
addressSchema.virtual('fullAddress').get(function () {
  const parts = [this.address, this.township, this.city].filter(
    (part) => part && part.trim()
  )
  return parts.join(', ')
})

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    addresses: [addressSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for unique username and email
userSchema.index({ username: 1 }, { unique: true })
userSchema.index({ email: 1 }, { unique: true })

// Method to check if email is taken (excluding current user)
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } })
  return !!user
}

// Method to check if username is taken (excluding current user)
userSchema.statics.isUsernameTaken = async function (username, excludeUserId) {
  const user = await this.findOne({ username, _id: { $ne: excludeUserId } })
  return !!user
}

// Hash the password whenever it is set/changed (stored in passwordHash).
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next()
  try {
    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10
    this.passwordHash = await bcrypt.hash(this.passwordHash, rounds)
    next()
  } catch (err) {
    next(err)
  }
})

// Compare a plaintext candidate against the stored hash.
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash)
}

// Issue a signed access token for this user.
userSchema.methods.generateAuthToken = function () {
  return generateAccessToken(this)
}

// Helper method to get user without password
userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()
  delete userObject.passwordHash
  return userObject
}

const User = mongoose.model('User', userSchema)

module.exports = User