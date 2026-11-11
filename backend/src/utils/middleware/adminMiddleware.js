// Admin-role guard. Applied after the auth middleware (protect) so req.user
// is already populated.
const { ForbiddenError } = require('../errors');

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return next(new ForbiddenError('Not authorized as an admin'));
};

module.exports = adminMiddleware;