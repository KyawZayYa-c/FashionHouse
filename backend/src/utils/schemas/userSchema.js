const joi = require('joi');

const userSchema = {
  register: joi.object({
    name: joi.string().min(3).max(50).required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).max(20).required(),
    phone: joi.string().min(7).max(15).required(),
    role: joi.string().valid('customer', 'admin'),
  }),

  login: joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  }),

  forgotPassword: joi.object({
    email: joi.string().email().required(),
  }),

  resetPassword: joi.object({
    token: joi.string().required(),
    password: joi.string().min(8).max(20).required(),
  }),

  verifyEmail: joi.object({
    token: joi.string().required(),
  }),

  resendVerification: joi.object({
    email: joi.string().email().required(),
  }),

  updateProfile: joi.object({
    name: joi.string().min(3).max(50),
    phone: joi.string().min(7).max(15).pattern(/^[\d\s\-+()]{7,15}$/),
  }).min(1).messages({
    'object.min': 'At least one field (name or phone) must be provided',
  }),

  changePassword: joi.object({
    currentPassword: joi.string().required(),
    newPassword: joi.string().min(8).max(20).required(),
  }),

  deactivateAccount: joi.object({
    password: joi.string().required(),
  }),

  deleteAccount: joi.object({
    password: joi.string().required(),
  }),
};

module.exports = userSchema;