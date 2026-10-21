const sendSuccess = (res, message = '', data = {}, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, message = 'Error', statusCode = 500, code = 'ERROR', details = null) => {
  res.status(statusCode).json({
    success: false,
    status: 'error',
    message,
    code,
    details,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
