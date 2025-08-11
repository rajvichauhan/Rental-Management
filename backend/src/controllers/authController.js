const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { AppError, catchAsync } = require("../middleware/errorHandler");
const { generateToken } = require("../middleware/auth");
const EmailService = require("../services/emailService");
// Temporarily disable email service to test server startup
const emailService = null; // new EmailService();
const logger = require("../utils/logger");

/**
 * Register a new user
 */
const register = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, true, errors.array()));
  }

  const { email, password, firstName, lastName, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("User with this email already exists", 409));
  }

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");

  // Create user
  const user = new User({
    email,
    password,
    firstName,
    lastName,
    phone,
    emailVerificationToken,
    role: "customer",
    isActive: true,
    emailVerified: false,
  });

  await user.save();

  // Send verification email
  if (emailService) {
    try {
      await emailService.sendVerificationEmail(
        email,
        firstName,
        emailVerificationToken
      );
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error("Failed to send verification email:", error);
      // Don't fail registration if email fails
    }
  }

  // Generate token
  const token = generateToken(user._id);

  // Log successful registration
  logger.info(`User registered successfully: ${email}`);

  res.status(201).json({
    success: true,
    message:
      "User registered successfully. Please check your email to verify your account.",
    data: {
      user: user.toJSON(),
      token,
    },
  });
});

/**
 * Login user
 */
const login = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, true, errors.array()));
  }

  const { email, password } = req.body;

  // Get user with password
  const user = await User.findOne({ email, isActive: true }).select(
    "+password"
  );

  if (!user) {
    logger.info(`Failed login attempt for email: ${email}`);
    return next(new AppError("Invalid email or password", 401));
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    logger.info(`Failed login attempt for email: ${email} - invalid password`);
    return next(new AppError("Invalid email or password", 401));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  // Log successful login
  logger.info(`User logged in successfully: ${email}`);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: user.toJSON(),
      token,
    },
  });
});

/**
 * Logout user
 */
const logout = catchAsync(async (req, res, next) => {
  // In a stateless JWT system, logout is handled client-side
  // But we can log the action for security purposes
  if (req.user) {
    logger.info(`User logged out: ${req.user.email}`);
  }

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

/**
 * Get current user (protected route)
 */
const getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user.toJSON(),
    },
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
};
