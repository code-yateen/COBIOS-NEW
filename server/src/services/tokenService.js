const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");
const env = require("../config/env");

class TokenService {
  // Generate Access Token (short-lived: 15 minutes)
  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY || "15m" }
    );
  }

  // Generate Refresh Token (long-lived: 7 days)
  async generateRefreshToken(user, userAgent, ipAddress) {
    const token = jwt.sign(
      { userId: user._id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRY || "7d" }
    );

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store refresh token in database
    await RefreshToken.create({
      userId: user._id,
      token,
      expiresAt,
      userAgent,
      ipAddress,
    });

    return token;
  }

  // Verify Access Token
  verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  }

  // Verify Refresh Token
  async verifyRefreshToken(token) {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);

    // Check if token exists in database and is not revoked
    const storedToken = await RefreshToken.findOne({
      token,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) {
      throw new Error("Invalid or expired refresh token");
    }

    return decoded;
  }

  // Revoke Refresh Token (on logout)
  async revokeRefreshToken(token) {
    await RefreshToken.updateOne({ token }, { isRevoked: true });
  }

  // Revoke All User Tokens (security feature)
  async revokeAllUserTokens(userId) {
    await RefreshToken.updateMany({ userId }, { isRevoked: true });
  }
}

module.exports = new TokenService();

