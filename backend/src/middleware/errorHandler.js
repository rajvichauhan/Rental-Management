const logger = require('../utils/logger');

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle database errors
 */
const handleDatabaseError = (error) => {
  let message = 'Database operation failed';
  let statusCode = 500;
  
  // PostgreSQL error codes
  switch (error.code) {
    case '23505': // unique_violation
      message = 'A record with this information already exists';
      statusCode = 409;
      break;
    case '23503': // foreign_key_violation
      message = 'Referenced record does not exist';
      statusCode = 400;
      break;
    case '23502': // not_null_violation
      message = 'Required field is missing';
      statusCode = 400;
      break;
    case '23514': // check_violation
      message = 'Invalid data provided';
      statusCode = 400;
      break;
    case '42P01': // undefined_table
      message = 'Database table not found';
      statusCode = 500;
      break;
    case '42703': // undefined_column
      message = 'Database column not found';
      statusCode = 500;
      break;
    default:
      if (error.message.includes('duplicate key')) {
        message = 'A record with this information already exists';
        statusCode = 409;
      } else if (error.message.includes('violates foreign key')) {
        message = 'Referenced record does not exist';
        statusCode = 400;
      }
      break;
  }
  
  return new AppError(message, statusCode);
};

/**
 * Handle JWT errors
 */
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AppError('Invalid token. Please log in again.', 401);
  }
  
  if (error.name === 'TokenExpiredError') {
    return new AppError('Your token has expired. Please log in again.', 401);
  }
  
  return new AppError('Authentication failed', 401);
};

/**
 * Handle validation errors
 */
const handleValidationError = (error) => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    const message = `Invalid input data: ${errors.join('. ')}`;
    return new AppError(message, 400);
  }
  
  return new AppError('Validation failed', 400);
};

/**
 * Handle Stripe errors
 */
const handleStripeError = (error) => {
  let message = 'Payment processing failed';
  let statusCode = 400;
  
  switch (error.type) {
    case 'StripeCardError':
      message = error.message || 'Your card was declined';
      statusCode = 402;
      break;
    case 'StripeRateLimitError':
      message = 'Too many requests made to the API too quickly';
      statusCode = 429;
      break;
    case 'StripeInvalidRequestError':
      message = 'Invalid parameters were supplied to Stripe API';
      statusCode = 400;
      break;
    case 'StripeAPIError':
      message = 'An error occurred with Stripe API';
      statusCode = 500;
      break;
    case 'StripeConnectionError':
      message = 'Network communication with Stripe failed';
      statusCode = 500;
      break;
    case 'StripeAuthenticationError':
      message = 'Authentication with Stripe API failed';
      statusCode = 500;
      break;
    default:
      message = error.message || 'Payment processing failed';
      break;
  }
  
  return new AppError(message, statusCode);
};

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR:', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Log the error
  logger.error('Error occurred:', {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    
    // Handle specific error types
    if (err.code && err.code.startsWith('23')) {
      error = handleDatabaseError(err);
    } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      error = handleJWTError(err);
    } else if (err.name === 'ValidationError') {
      error = handleValidationError(err);
    } else if (err.type && err.type.startsWith('Stripe')) {
      error = handleStripeError(err);
    } else if (err.name === 'MulterError') {
      if (err.code === 'LIMIT_FILE_SIZE') {
        error = new AppError('File too large', 413);
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        error = new AppError('Too many files', 413);
      } else {
        error = new AppError('File upload error', 400);
      }
    }
    
    sendErrorProd(error, res);
  }
};

/**
 * Catch async errors wrapper
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Handle 404 errors for undefined routes
 */
const notFound = (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
};

module.exports = {
  AppError,
  errorHandler,
  catchAsync,
  notFound
};
