require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Import models
const User = require("./src/models/User");
const Category = require("./src/models/Category");
const Product = require("./src/models/Product");

const app = express();
const PORT = process.env.PORT || 5000;

// Simple console logger
const log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  debug: (msg) => console.log(`[DEBUG] ${msg}`),
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/rental_management", {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    log.info("MongoDB connected successfully");
  } catch (error) {
    log.error("MongoDB connection failed: " + error.message);
    process.exit(1);
  }
};

// JWT helper functions
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
};

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      role: "customer",
      isActive: true,
      emailVerified: true,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    log.error("Registration error: " + error.message);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    log.error("Login error: " + error.message);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

// Products routes
app.get("/api/products", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sortBy = "name",
      sortOrder = "asc",
      minPrice,
      maxPrice,
      condition,
      isActive = true,
    } = req.query;

    // Build filter object
    const filter = { isActive: isActive === "true" || isActive === true };

    log.debug(
      `Products query - filter: ${JSON.stringify(
        filter
      )}, page: ${page}, limit: ${limit}`
    );

    if (category && category !== "all") {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (condition) {
      filter.condition = condition;
    }

    // Add price filtering based on replacement value
    if (minPrice || maxPrice) {
      filter.replacementValue = {};
      if (minPrice) {
        filter.replacementValue.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        filter.replacementValue.$lte = parseFloat(maxPrice);
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const products = await Product.find(filter)
      .populate("category", "name description")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    log.debug(`Found ${products.length} products, total: ${total}`);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage,
        },
      },
    });
  } catch (error) {
    log.error("Error fetching products: " + error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
});

app.get("/api/products/categories", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    log.error("Error fetching categories: " + error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("category", "name description")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    log.error("Error fetching product: " + error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
});

// User profile route
app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user.toJSON(),
    });
  } catch (error) {
    log.error("Profile error: " + error.message);
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: error.message,
    });
  }
});

// Orders routes - NO VALIDATION, just create orders
app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const { user } = req;
    const {
      items = [],
      billingAddress = {},
      deliveryAddress = {},
      deliveryMethod = "home_delivery",
      paymentMethod = "cod",
      subtotal = 0,
      taxAmount = 0,
      deliveryCharge = 0,
      discountAmount = 0,
      totalAmount = 0,
      appliedCoupon = null,
      notes = "",
    } = req.body;

    // Generate order data
    const orderId =
      "order_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const orderNumber = "ORD-" + Date.now();

    log.info(`Order created: ${orderId} by user: ${user._id}`);
    log.info(`Order data: ${items.length} items, total: ${totalAmount}`);

    // Always return success - no database required for now
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        id: orderId,
        orderNumber: orderNumber,
        status: "pending",
        totalAmount: totalAmount || 0,
        subtotal: subtotal || 0,
        taxAmount: taxAmount || 0,
        deliveryCharge: deliveryCharge || 0,
        discountAmount: discountAmount || 0,
        deliveryMethod: deliveryMethod || "home_delivery",
        paymentMethod: paymentMethod || "cod",
        itemsCount: items.length,
        createdAt: new Date().toISOString(),
        billingAddress,
        deliveryAddress: deliveryAddress.street
          ? deliveryAddress
          : billingAddress,
        appliedCoupon,
        notes:
          notes ||
          `Order created. Items: ${items.length}, Total: ${totalAmount}`,
        customerId: user._id,
      },
    });
  } catch (error) {
    log.error("Order creation error: " + error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
});

// Get user's orders
app.get("/api/orders/my-orders", authenticateToken, async (req, res) => {
  try {
    const mockOrders = [
      {
        id: "order_1",
        orderNumber: "ORD-001",
        status: "pending",
        totalAmount: 100,
        createdAt: new Date().toISOString(),
        customerId: req.user._id,
      },
    ];

    res.json({
      success: true,
      data: {
        orders: mockOrders,
        pagination: {
          page: 1,
          limit: 10,
          total: mockOrders.length,
        },
      },
    });
  } catch (error) {
    log.error("Get orders error: " + error.message);
    res.status(500).json({
      success: false,
      message: "Failed to get orders",
      error: error.message,
    });
  }
});

// Get single order
app.get("/api/orders/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const mockOrder = {
      id: id,
      orderNumber: "ORD-" + Date.now(),
      status: "pending",
      totalAmount: 150,
      createdAt: new Date().toISOString(),
      customerId: req.user._id,
      items: [],
    };

    res.json({
      success: true,
      data: mockOrder,
    });
  } catch (error) {
    log.error("Get order error: " + error.message);
    res.status(500).json({
      success: false,
      message: "Failed to get order",
      error: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  log.error("Unhandled error: " + err.message);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      log.info(`Server running on port ${PORT}`);
      log.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    log.error("Failed to start server: " + error.message);
    process.exit(1);
  }
};

startServer();
