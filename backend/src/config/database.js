const { Pool } = require('pg');
const logger = require('../utils/logger');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'rental_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
  connectionTimeoutMillis: 2000, // How long to wait for a connection
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Handle pool connection
pool.on('connect', (client) => {
  logger.debug('New client connected to database');
});

// Handle pool removal
pool.on('remove', (client) => {
  logger.debug('Client removed from pool');
});

/**
 * Connect to the database
 */
const connectDB = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    logger.info(`Database connected successfully at ${result.rows[0].now}`);
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error.message);
    throw error;
  }
};

/**
 * Execute a query
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object} Query result
 */
const query = async (text, params = []) => {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug('Executed query', {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      duration: `${duration}ms`,
      rows: result.rowCount
    });
    
    return result;
  } catch (error) {
    logger.error('Query execution failed:', {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      error: error.message,
      params
    });
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns {Object} Database client
 */
const getClient = async () => {
  try {
    const client = await pool.connect();
    
    // Add query method to client for consistency
    const originalQuery = client.query.bind(client);
    client.query = async (text, params = []) => {
      const start = Date.now();
      
      try {
        const result = await originalQuery(text, params);
        const duration = Date.now() - start;
        
        logger.debug('Executed transaction query', {
          text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          duration: `${duration}ms`,
          rows: result.rowCount
        });
        
        return result;
      } catch (error) {
        logger.error('Transaction query failed:', {
          text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          error: error.message,
          params
        });
        throw error;
      }
    };
    
    return client;
  } catch (error) {
    logger.error('Failed to get database client:', error.message);
    throw error;
  }
};

/**
 * Execute multiple queries in a transaction
 * @param {Function} callback - Function containing transaction logic
 * @returns {*} Transaction result
 */
const transaction = async (callback) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    
    logger.debug('Transaction completed successfully');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Close all database connections
 */
const closeDB = async () => {
  try {
    await pool.end();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error.message);
    throw error;
  }
};

/**
 * Check if database is healthy
 * @returns {boolean} Database health status
 */
const isHealthy = async () => {
  try {
    const result = await query('SELECT 1 as health_check');
    return result.rows.length > 0;
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
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  };
};

module.exports = {
  pool,
  connectDB,
  query,
  getClient,
  transaction,
  closeDB,
  isHealthy,
  getStats
};
