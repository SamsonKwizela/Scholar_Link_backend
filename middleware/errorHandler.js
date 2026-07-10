const { createErrorResponse } = require('../utils/response');

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  console.error(`[${req.method}] ${req.originalUrl} -> ${err.message}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Server error';

  res.status(statusCode).json(createErrorResponse(message));
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
