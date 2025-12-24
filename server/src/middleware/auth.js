const tokenService = require("../services/tokenService");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Access token is required");
    }

    const token = authHeader.split(" ")[1];
    const decoded = tokenService.verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      throw new ApiError(401, "User not found or inactive");
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Access token has expired"));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid access token"));
    }
    next(error);
  }
};

module.exports = auth;

