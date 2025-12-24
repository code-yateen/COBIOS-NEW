const User = require("../models/User");
const tokenService = require("../services/tokenService");
const authService = require("../services/authService");
const emailService = require("../services/emailService");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { generateToken } = require("../utils/helpers");

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.login(email, password);

  // Generate tokens
  const accessToken = tokenService.generateAccessToken(user);
  const refreshToken = await tokenService.generateRefreshToken(
    user,
    req.headers["user-agent"],
    req.ip
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    },
  });
});

exports.register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);

  // Generate tokens
  const accessToken = tokenService.generateAccessToken(user);
  const refreshToken = await tokenService.generateRefreshToken(
    user,
    req.headers["user-agent"],
    req.ip
  );

  // Send welcome email
  await emailService.sendWelcomeEmail(user);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    },
  });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is required");
  }

  // Verify refresh token
  const decoded = await tokenService.verifyRefreshToken(refreshToken);

  // Find user
  const user = await User.findById(decoded.userId);

  if (!user || !user.isActive) {
    throw new ApiError(401, "User not found or inactive");
  }

  // Generate new access token
  const newAccessToken = tokenService.generateAccessToken(user);

  res.status(200).json({
    success: true,
    data: {
      accessToken: newAccessToken,
    },
  });
});

exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await tokenService.revokeRefreshToken(refreshToken);
  }

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.userId);

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if user exists or not
    return res.status(200).json({
      success: true,
      message: "If an account exists, a password reset email has been sent.",
    });
  }

  // Generate reset token
  const resetToken = generateToken();
  const resetExpires = new Date();
  resetExpires.setHours(resetExpires.getHours() + 1);

  user.passwordResetToken = resetToken;
  user.passwordResetExpires = resetExpires;
  await user.save({ validateBeforeSave: false });

  // Send reset email
  await emailService.sendPasswordResetEmail(user, resetToken);

  res.status(200).json({
    success: true,
    message: "If an account exists, a password reset email has been sent.",
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});

