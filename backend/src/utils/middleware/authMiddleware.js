const { verifyAccessToken } = require('../jwtToken');
const { AuthError, ForbiddenError } = require('../errors');
const User = require('../../models/User');

const extractToken = (req) => {
  if (req.cookies && req.cookies.token) return req.cookies.token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

// Authentication guard. Loads the full user document onto req.user so that
// downstream controllers can read profile fields and call .save().
const protect = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return next(new AuthError('Not authorized, no token provided'));
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AuthError('Not authorized, user no longer exists'));
    }
    if (!user.isActive) {
      return next(new AuthError('Account is disabled'));
    }
    req.user = user;
    return next();
  } catch (_error) {
    if (_error.name === 'TokenExpiredError') {
      return next(new AuthError('Token expired, please log in again'));
    }
    return next(new AuthError('Not authorized, token invalid'));
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return next(new ForbiddenError('Not authorized as an admin'));
};

const optionalAuth = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) req.user = user;
  } catch {
    // Ignore invalid tokens for optional auth
  }
  return next();
};

// Routes import this module directly as a middleware function.
module.exports = protect;
module.exports.protect = protect;
module.exports.admin = admin;
module.exports.optionalAuth = optionalAuth;