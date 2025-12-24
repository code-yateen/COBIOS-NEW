const User = require("../models/User");
const tokenService = require("./tokenService");
const ApiError = require("../utils/ApiError");

class AuthService {
  async login(email, password) {
    // Find user with password field
    const user = await User.findOne({ email, isActive: true }).select(
      "+password"
    );

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    return user;
  }

  async register(userData) {
    const { email, password, name, role, phone } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, "User with this email already exists");
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      role: role || "member",
      phone,
    });

    return user;
  }

  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw new ApiError(404, "User not found or inactive");
    }
    return user;
  }
}

module.exports = new AuthService();

