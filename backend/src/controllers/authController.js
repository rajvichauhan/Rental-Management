const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const { query, transaction } = require("../config/database");
const { AppError, catchAsync } = require("../middleware/errorHandler");
const { generateToken, verifyToken } = require("../middleware/auth");
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
  const existingUser = await query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existingUser.rows.length > 0) {
    return next(new AppError("User with this email already exists", 409));
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");

  // Create user
  const userId = uuidv4();
  const result = await query(
    `
    INSERT INTO users (id, email, password_hash, first_name, last_name, phone, email_verification_token)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, email, first_name, last_name, role, is_active, email_verified
  `,
    [
      userId,
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      emailVerificationToken,
    ]
  );

  const user = result.rows[0];

  // Send verification email
  try {
    await emailService.sendVerificationEmail(
      email,
      firstName,
      emailVerificationToken
    );
  } catch (error) {
    logger.error("Failed to send verification email:", error);
    // Don't fail registration if email fails
  }

  // Generate token
  const token = generateToken(user.id);

  // Log successful registration
  logger.logAuth(
    "register",
    user.id,
    user.email,
    req.ip,
    req.get("User-Agent"),
    true
  );

  res.status(201).json({
    status: "success",
    message:
      "User registered successfully. Please check your email to verify your account.",
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified,
      },
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
  const result = await query(
    `
    SELECT id, email, password_hash, first_name, last_name, role, is_active, email_verified
    FROM users 
    WHERE email = $1
  `,
    [email]
  );

  if (result.rows.length === 0) {
    logger.logAuth(
      "login",
      null,
      email,
      req.ip,
      req.get("User-Agent"),
      false,
      new Error("User not found")
    );
    return next(new AppError("Invalid email or password", 401));
  }

  const user = result.rows[0];

  // Check if user is active
  if (!user.is_active) {
    logger.logAuth(
      "login",
      user.id,
      email,
      req.ip,
      req.get("User-Agent"),
      false,
      new Error("Account deactivated")
    );
    return next(
      new AppError(
        "Your account has been deactivated. Please contact support.",
        401
      )
    );
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    logger.logAuth(
      "login",
      user.id,
      email,
      req.ip,
      req.get("User-Agent"),
      false,
      new Error("Invalid password")
    );
    return next(new AppError("Invalid email or password", 401));
  }

  // Update last login
  await query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [
    user.id,
  ]);

  // Generate token
  const token = generateToken(user.id);

  // Log successful login
  logger.logAuth(
    "login",
    user.id,
    user.email,
    req.ip,
    req.get("User-Agent"),
    true
  );

  res.status(200).json({
    status: "success",
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified,
      },
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
    logger.logAuth(
      "logout",
      req.user.id,
      req.user.email,
      req.ip,
      req.get("User-Agent"),
      true
    );
  }

  res.status(200).json({
    status: "success",
    message: "Logout successful",
  });
});

/**
 * Refresh token
 */
const refreshToken = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("No token provided", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const result = await query(
      "SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return next(new AppError("User no longer exists or is inactive", 401));
    }

    const user = result.rows[0];
    const newToken = generateToken(user.id);

    res.status(200).json({
      status: "success",
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    return next(new AppError("Invalid token", 401));
  }
});

/**
 * Forgot password
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, true, errors.array()));
  }

  const { email } = req.body;

  // Get user
  const result = await query(
    "SELECT id, first_name FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    // Don't reveal if email exists or not
    return res.status(200).json({
      status: "success",
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  }

  const user = result.rows[0];

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save reset token
  await query(
    `
    UPDATE users 
    SET password_reset_token = $1, password_reset_expires = $2 
    WHERE id = $3
  `,
    [resetToken, resetTokenExpires, user.id]
  );

  // Send reset email
  try {
    await emailService.sendPasswordResetEmail(
      email,
      user.first_name,
      resetToken
    );

    logger.logAuth(
      "forgot_password",
      user.id,
      email,
      req.ip,
      req.get("User-Agent"),
      true
    );
  } catch (error) {
    // Clear reset token if email fails
    await query(
      `
      UPDATE users 
      SET password_reset_token = NULL, password_reset_expires = NULL 
      WHERE id = $1
    `,
      [user.id]
    );

    logger.error("Failed to send password reset email:", error);
    return next(
      new AppError(
        "Failed to send password reset email. Please try again.",
        500
      )
    );
  }

  res.status(200).json({
    status: "success",
    message: "Password reset link sent to your email",
  });
});

/**
 * Reset password
 */
const resetPassword = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, true, errors.array()));
  }

  const { token, password } = req.body;

  // Get user by reset token
  const result = await query(
    `
    SELECT id, email, first_name 
    FROM users 
    WHERE password_reset_token = $1 AND password_reset_expires > CURRENT_TIMESTAMP
  `,
    [token]
  );

  if (result.rows.length === 0) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  const user = result.rows[0];

  // Hash new password
  const passwordHash = await bcrypt.hash(password, 12);

  // Update password and clear reset token
  await query(
    `
    UPDATE users 
    SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL
    WHERE id = $2
  `,
    [passwordHash, user.id]
  );

  // Generate new token
  const authToken = generateToken(user.id);

  logger.logAuth(
    "reset_password",
    user.id,
    user.email,
    req.ip,
    req.get("User-Agent"),
    true
  );

  res.status(200).json({
    status: "success",
    message: "Password reset successful",
    data: {
      token: authToken,
    },
  });
});

/**
 * Verify email
 */
const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  // Find user by verification token
  const result = await query(
    `
    SELECT id, email, first_name 
    FROM users 
    WHERE email_verification_token = $1
  `,
    [token]
  );

  if (result.rows.length === 0) {
    return next(new AppError("Invalid verification token", 400));
  }

  const user = result.rows[0];

  // Update user as verified
  await query(
    `
    UPDATE users 
    SET email_verified = true, email_verification_token = NULL 
    WHERE id = $1
  `,
    [user.id]
  );

  logger.logAuth(
    "verify_email",
    user.id,
    user.email,
    req.ip,
    req.get("User-Agent"),
    true
  );

  res.status(200).json({
    status: "success",
    message: "Email verified successfully",
  });
});

/**
 * Resend verification email
 */
const resendVerification = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, true, errors.array()));
  }

  const { email } = req.body;

  // Get user
  const result = await query(
    `
    SELECT id, first_name, email_verified 
    FROM users 
    WHERE email = $1
  `,
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(200).json({
      status: "success",
      message:
        "If an account with that email exists and is unverified, a verification email has been sent.",
    });
  }

  const user = result.rows[0];

  if (user.email_verified) {
    return res.status(200).json({
      status: "success",
      message: "Email is already verified",
    });
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Update verification token
  await query(
    `
    UPDATE users 
    SET email_verification_token = $1 
    WHERE id = $2
  `,
    [verificationToken, user.id]
  );

  // Send verification email
  try {
    await emailService.sendVerificationEmail(
      email,
      user.first_name,
      verificationToken
    );
  } catch (error) {
    logger.error("Failed to send verification email:", error);
    return next(
      new AppError("Failed to send verification email. Please try again.", 500)
    );
  }

  res.status(200).json({
    status: "success",
    message: "Verification email sent",
  });
});

/**
 * Change password (protected route)
 */
const changePassword = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, true, errors.array()));
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Get current password hash
  const result = await query("SELECT password_hash FROM users WHERE id = $1", [
    userId,
  ]);
  const user = result.rows[0];

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password_hash
  );
  if (!isCurrentPasswordValid) {
    return next(new AppError("Current password is incorrect", 400));
  }

  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  // Update password
  await query("UPDATE users SET password_hash = $1 WHERE id = $2", [
    newPasswordHash,
    userId,
  ]);

  logger.logAuth(
    "change_password",
    userId,
    req.user.email,
    req.ip,
    req.get("User-Agent"),
    true
  );

  res.status(200).json({
    status: "success",
    message: "Password changed successfully",
  });
});

/**
 * Get current user (protected route)
 */
const getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
});

/**
 * Update current user (protected route)
 */
const updateMe = catchAsync(async (req, res, next) => {
  const { firstName, lastName, phone } = req.body;
  const userId = req.user.id;

  // Update user
  const result = await query(
    `
    UPDATE users 
    SET first_name = $1, last_name = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING id, email, first_name, last_name, phone, role, is_active, email_verified
  `,
    [firstName, lastName, phone, userId]
  );

  const user = result.rows[0];

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified,
      },
    },
  });
});

/**
 * Delete current user (protected route)
 */
const deleteMe = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // Soft delete - deactivate account
  await query("UPDATE users SET is_active = false WHERE id = $1", [userId]);

  logger.logAuth(
    "delete_account",
    userId,
    req.user.email,
    req.ip,
    req.get("User-Agent"),
    true
  );

  res.status(204).json({
    status: "success",
    message: "Account deactivated successfully",
  });
});

/**
 * Protect middleware
 */
const protect = verifyToken;

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  changePassword,
  getMe,
  updateMe,
  deleteMe,
  protect,
};
