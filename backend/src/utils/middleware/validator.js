const joi = require('joi');
const { ValidationError } = require('../errors');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return next(new ValidationError('Validation failed', details));
    }

    req[property] = value;
    next();
  };
};

// Schemas aligned with authController (username / email / password).
const registerSchema = joi.object({
  username: joi.string().min(3).max(50).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).max(100).required(),
  phone: joi.string().min(7).max(15).optional(),
  role: joi.string().valid('customer', 'admin').optional(),
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

const registerValidator = validate(registerSchema);
const loginValidator = validate(loginSchema);

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  registerSchema,
  loginSchema,
};