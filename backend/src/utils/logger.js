const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    handleExceptions: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    handleExceptions: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false,
});

// Handle uncaught exceptions and unhandled rejections
logger.exceptions.handle(
  new winston.transports.File({ 
    filename: path.join(logsDir, 'exceptions.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
);

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Add request logging helper
logger.logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.http(message);
    }
  });
  
  if (next) next();
};

// Add database query logging helper
logger.logQuery = (query, params, duration, error) => {
  const message = {
    query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
    params: params ? params.length : 0,
    duration: `${duration}ms`
  };
  
  if (error) {
    logger.error('Database query failed:', { ...message, error: error.message });
  } else {
    logger.debug('Database query executed:', message);
  }
};

// Add authentication logging helper
logger.logAuth = (action, userId, email, ip, userAgent, success = true, error = null) => {
  const message = {
    action,
    userId,
    email,
    ip,
    userAgent: userAgent ? userAgent.substring(0, 100) : null,
    success,
    timestamp: new Date().toISOString()
  };
  
  if (error) {
    message.error = error.message;
  }
  
  if (success) {
    logger.info(`Auth ${action} successful:`, message);
  } else {
    logger.warn(`Auth ${action} failed:`, message);
  }
};

// Add business logic logging helper
logger.logBusiness = (action, details, userId = null) => {
  const message = {
    action,
    details,
    userId,
    timestamp: new Date().toISOString()
  };
  
  logger.info('Business action:', message);
};

// Add security logging helper
logger.logSecurity = (event, details, severity = 'medium') => {
  const message = {
    event,
    details,
    severity,
    timestamp: new Date().toISOString()
  };
  
  if (severity === 'high') {
    logger.error('Security event:', message);
  } else if (severity === 'medium') {
    logger.warn('Security event:', message);
  } else {
    logger.info('Security event:', message);
  }
};

module.exports = logger;
