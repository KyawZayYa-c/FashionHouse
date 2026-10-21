const { ValidationError } = require('../utils/errors');

const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !isValidObjectId(id)) {
      return next(new ValidationError(`Invalid ${paramName} format`));
    }
    next();
  };
};

module.exports = {
  validateObjectId,
  isValidObjectId,
};