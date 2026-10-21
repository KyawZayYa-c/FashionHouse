const { verifyAccessToken } = require('../jwtToken');
const { AuthError, ForbiddenError } = require('../../src/utils/errors');

const protect = (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AuthError('Not authorized, no token provided'));
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (_error) {
    if (_error.name === 'TokenExpiredError') {
      return next(new AuthError('Token expired, please log in again'));
    }
    return next(new AuthError('Not authorized, token invalid'));
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return next(new ForbiddenError('Not authorized as an admin'));
  }
};

const optionalAuth = (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
};

module.exports = {
  protect,
  admin,
  optionalAuth,
};
