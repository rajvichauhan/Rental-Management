const { AppError } = require('./errorHandler');

/**
 * Handle 404 errors for undefined routes
 */
const notFound = (req, res, next) => {
  const err = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(err);
};

module.exports = {
  notFound
};
