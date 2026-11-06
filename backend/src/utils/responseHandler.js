const responseHandler = (res, statusCode, data = {}, message = 'Success') => {
  const response = {
    success: statusCode < 400,
    message,
    data,
  };

  res.status(statusCode).json(response);
};

module.exports = {
  success: (res, statusCode = 200, data = {}, message = 'Success') =>
    responseHandler(res, statusCode, data, message),

  error: (res, statusCode, message, errors = []) => {
    const response = {
      success: false,
      message,
      errors,
    };

    res.status(statusCode).json(response);
  },
};

module.exports.AsyncHandler = (controller) => {
  return (req, res, next) => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
};