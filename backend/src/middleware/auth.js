const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AppError, catchAsync } = require("./errorHandler");
const logger = require("../utils/logger");

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Verify JWT token and get user
 */
const verifyToken = catchAsync(async (req, res, next) => {
  // Get token from header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check if user still exists
  const user = await User.findById(decoded.userId);

  if (!user) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // Check if user is active
  if (!user.isActive) {
    return next(
      new AppError(
        "Your account has been deactivated. Please contact support.",
        401
      )
    );
  }

  // Grant access to protected route
  req.user = user;

  // Log successful authentication
  logger.info(`Token verified for user: ${user.email}`);

  next();
});

/**
 * Restrict access to specific roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logger.error(
        `Unauthorized access attempt by user ${req.user.email} with role ${req.user.role} to ${req.originalUrl}`
      );

      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Token is invalid, but we don't fail - just continue without user
      logger.debug("Invalid token in optional auth:", error.message);
    }
  }

  next();
});

/**
 * Check if user owns the resource or is admin/staff
 */
const checkOwnership = (resourceUserIdField = "customer_id") => {
  return (req, res, next) => {
    const resourceUserId = req.resource?.[resourceUserIdField];
    const currentUserId = req.user._id.toString();
    const userRole = req.user.role;

    // Admin and staff can access any resource
    if (userRole === "admin" || userRole === "staff") {
      return next();
    }

    // Users can only access their own resources
    if (resourceUserId !== currentUserId) {
      logger.error(
        `Ownership violation: User ${currentUserId} tried to access resource owned by ${resourceUserId}`
      );

      return next(new AppError("You can only access your own resources", 403));
    }

    next();
  };
};

/**
 * Rate limiting for authentication endpoints
 */
const authRateLimit = require("express-rate-limit")({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logSecurity(
      "auth_rate_limit_exceeded",
      {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        route: req.originalUrl,
      },
      "medium"
    );

    res.status(429).json({
      error: "Too many authentication attempts, please try again later.",
    });
  },
});

/**
 * Validate API key for webhook endpoints
 */
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const validApiKey = process.env.API_KEY;

  if (!apiKey || !validApiKey || apiKey !== validApiKey) {
    logger.logSecurity(
      "invalid_api_key",
      {
        providedKey: apiKey ? "provided" : "missing",
        ip: req.ip,
        route: req.originalUrl,
      },
      "high"
    );

    return next(new AppError("Invalid API key", 401));
  }

  next();
};

module.exports = {
  generateToken,
  verifyToken,
  restrictTo,
  optionalAuth,
  checkOwnership,
  authRateLimit,
  validateApiKey,
};
