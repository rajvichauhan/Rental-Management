require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Simple console logger
const log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  debug: (msg) => console.log(`[DEBUG] ${msg}`)
};

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'rental_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

const pool = new Pool(dbConfig);

// JWT helper functions
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Test database endpoint
app.get('/test-db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({ 
      status: 'Database connected', 
      time: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Database connection failed', 
      error: error.message 
    });
  }
});

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    log.info(`Registration attempt for email: ${email}`);
    
    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        status: 'error',
        message: 'All required fields must be provided'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }
    
    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Check if user already exists
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create user
    const userId = uuidv4();
    const result = await client.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, is_active, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, email, first_name, last_name, role, is_active, email_verified
    `, [userId, email, passwordHash, firstName, lastName, phone, 'customer', true, false]);
    
    const user = result.rows[0];
    
    // Generate token
    const token = generateToken(user.id);
    
    log.info(`User registered successfully: ${email}`);
    
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          isActive: user.is_active,
          emailVerified: user.email_verified
        },
        token
      }
    });
    
  } catch (error) {
    log.error(`Registration error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  } finally {
    client.release();
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password } = req.body;
    
    log.info(`Login attempt for email: ${email}`);
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }
    
    // Get user with password
    const result = await client.query(`
      SELECT id, email, password_hash, first_name, last_name, role, is_active, email_verified
      FROM users 
      WHERE email = $1
    `, [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }
    
    const user = result.rows[0];
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated'
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }
    
    // Generate token
    const token = generateToken(user.id);
    
    log.info(`User logged in successfully: ${email}`);
    
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          isActive: user.is_active,
          emailVerified: user.email_verified
        },
        token
      }
    });
    
  } catch (error) {
    log.error(`Login error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  } finally {
    client.release();
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  try {
    log.info('User logout request');

    res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });

  } catch (error) {
    log.error(`Logout error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    log.info(`Database connected successfully at ${result.rows[0].now}`);
    
    app.listen(PORT, () => {
      log.info(`Server running on port ${PORT}`);
      log.info(`Health check: http://localhost:${PORT}/health`);
      log.info(`Frontend should be able to connect now`);
    });
    
  } catch (error) {
    log.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
