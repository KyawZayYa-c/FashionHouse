const catchAsync = require('../../utils/catchAsync');
const responseHandler = require('../../utils/responseHandler');
const User = require('../models/User');
const AppError = require('../../utils/errors').AppError;
const ValidationError = require('../../utils/errors').ValidationError;
const NotFoundError = require('../../utils/errors').NotFoundError;

// Register a new user
const register = catchAsync(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    responseHandler.error(res, 400, 'Username, email, and password are required');
    return;
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    if (existingUser.email === email) {
      responseHandler.error(res, 409, 'Email already registered');
    } else {
      responseHandler.error(res, 409, 'Username already taken');
    }
    return;
  }

  // Create new user
  const newUser = new User({
    username,
    email,
    passwordHash: password, // Password will be hashed by pre-save middleware
  });

  await newUser.save();

  // Generate JWT token
  const token = newUser.generateAuthToken();

  responseHandler.success(res, 201, {
    token,
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    },
  }, 'User registered successfully');
});

// Login user
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    responseHandler.error(res, 400, 'Email and password are required');
    return;
  }

  // Find user by email
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    responseHandler.error(res, 401, 'Invalid email or password');
    return;
  }

  // Check if password is correct (compare plain text - in production use bcrypt)
  if (user.passwordHash !== password) {
    responseHandler.error(res, 401, 'Invalid email or password');
    return;
  }

  // Check if user is active
  if (!user.isActive) {
    responseHandler.error(res, 401, 'Account is disabled');
    return;
  }

  // Generate JWT token
  const token = user.generateAuthToken();

  responseHandler.success(res, 200, {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  }, 'Login successful');
});

// Get current user profile
const getMe = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  responseHandler.success(res, 200, req.user, 'User profile retrieved successfully');
});

// Update user profile
const updateProfile = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const { name, phone, address } = req.body;

  // Update user profile fields
  if (name) req.user.name = name;
  if (phone) req.user.phone = phone;
  if (address) req.user.address = address;

  await req.user.save({ validateBeforeSave: false });

  responseHandler.success(res, 200, {
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    },
  }, 'Profile updated successfully');
});

// Change password
const changePassword = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    responseHandler.error(res, 400, 'Current password and new password are required');
    return;
  }

  // Check if current password is correct
  if (req.user.passwordHash !== currentPassword) {
    responseHandler.error(res, 401, 'Current password is incorrect');
    return;
  }

  // Update password
  req.user.passwordHash = newPassword;
  await req.user.save({ validateBeforeSave: false });

  responseHandler.success(res, 200, {}, 'Password changed successfully');
});

// Manage user addresses
const manageAddresses = catchAsync(async (req, res) => {
  if (!req.user) {
    responseHandler.error(res, 401, 'Not authenticated');
    return;
  }

  const { action, address } = req.body;

  if (action === 'add') {
    // Add new address
    if (!address || !address.street || !address.city) {
      responseHandler.error(res, 400, 'Valid address is required');
      return;
    }

    if (!req.user.addresses) {
      req.user.addresses = [];
    }

    req.user.addresses.push({
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      isDefault: address.isDefault || false,
    });
  } else if (action === 'get') {
    // Return addresses
    responseHandler.success(res, 200, { addresses: req.user.addresses || [] }, 'Addresses retrieved successfully');
    return;
  } else if (action === 'delete') {
    const { addressId } = req.body;

    if (!addressId) {
      responseHandler.error(res, 400, 'Address ID is required');
      return;
    }

    if (req.user.addresses) {
      req.user.addresses = req.user.addresses.filter(
        (addr) => addr._id.toString() !== addressId
      );
    }
  }

  await req.user.save({ validateBeforeSave: false });

  responseHandler.success(res, 200, { action }, 'Address management completed');
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  manageAddresses,
};