const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Database configuration
const dbConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/rental_management',
  options: {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    bufferCommands: false, // Disable mongoose buffering
    bufferMaxEntries: 0, // Disable mongoose buffering
  }
};

/**
 * Connect to the database
 */
const connectDB = async () => {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options);
    logger.info('MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    logger.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

/**
 * Close all database connections
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connections closed');
  } catch (error) {
    logger.error('Error closing MongoDB connections:', error.message);
    throw error;
  }
};

/**
 * Check if database is healthy
 * @returns {boolean} Database health status
 */
const isHealthy = async () => {
  try {
    return mongoose.connection.readyState === 1;
  } catch (error) {
    logger.error('Database health check failed:', error.message);
    return false;
  }
};

/**
 * Get database statistics
 * @returns {Object} Database statistics
 */
const getStats = () => {
  return {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name
  };
};

// Handle connection events
mongoose.connection.on('connected', () => {
  logger.info('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.info('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

module.exports = {
  mongoose,
  connectDB,
  closeDB,
  isHealthy,
  getStats
};
