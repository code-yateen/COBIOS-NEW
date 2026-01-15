const User = require("../models/User");
const tokenService = require("./tokenService");
const ApiError = require("../utils/ApiError");

class AuthService {
  /*
  async login(email, password) {
    // Email is already normalized by validator, but ensure it's lowercase and trimmed
    // The User schema has lowercase: true, so it will be stored lowercase
    const normalizedEmail = email ? email.toLowerCase().trim() : email;

    if (!normalizedEmail || !password) {
      throw new ApiError(401, "Email and password are required");
    }

    // Find user with password field (schema handles lowercase conversion)
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Check if user is active
    if (user.isActive === false) {
      throw new ApiError(401, "Account is inactive. Please contact administrator.");
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    return user;
  }
*/

async login(email, password) {
  // Email is already normalized by validator, but ensure it's lowercase and trimmed
  const normalizedEmail = email ? email.toLowerCase().trim() : email;
  
  console.log('=== LOGIN DEBUG START ===');
  console.log('1. Original email:', email);
  console.log('2. Normalized email:', normalizedEmail);
  console.log('3. Password length:', password ? password.length : 0);

  if (!normalizedEmail || !password) {
    throw new ApiError(401, "Email and password are required");
  }

  // Find user with password field
  const user = await User.findOne({ email: normalizedEmail }).select("+password");
  
  console.log('4. User found:', user ? 'YES' : 'NO');
  if (user) {
    console.log('5. User email from DB:', user.email);
    console.log('6. User has password:', user.password ? 'YES' : 'NO');
    console.log('7. User isActive:', user.isActive);
  }

  if (!user) {
    console.log('=== LOGIN FAILED: User not found ===');
    throw new ApiError(401, "Invalid email or password");
  }

  // Check if user is active
  if (user.isActive === false) {
    console.log('=== LOGIN FAILED: User inactive ===');
    throw new ApiError(401, "Account is inactive. Please contact administrator.");
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  console.log('8. Password valid:', isPasswordValid);

  if (!isPasswordValid) {
    console.log('=== LOGIN FAILED: Invalid password ===');
    throw new ApiError(401, "Invalid email or password");
  }

  console.log('=== LOGIN SUCCESS ===');
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

