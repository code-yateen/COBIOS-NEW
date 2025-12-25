# Cobios Gym Management System - Backend Documentation

A comprehensive gym management system backend built with the MERN stack (MongoDB, Express.js, Node.js). This document outlines the complete backend architecture, database schemas, API endpoints, authentication flow, and AI integration requirements.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Environment Variables](#environment-variables)
5. [Database Schema](#database-schema)
6. [Authentication & Authorization](#authentication--authorization)
7. [API Endpoints](#api-endpoints)
8. [AI Integration](#ai-integration)
9. [Middleware](#middleware)
10. [Error Handling](#error-handling)
11. [Installation & Setup](#installation--setup)

---

## Project Overview

Cobios Gym Management System is a full-featured platform for managing gym operations including:

- **Multi-role user management** (Admin, Trainer, Member)
- **Membership & subscription management**
- **AI-powered workout and diet plan generation**
- **Progress tracking with body metrics**
- **Payment processing and invoicing**
- **Attendance tracking**
- **Feedback system**
- **Real-time notifications**

---

## Tech Stack

| Technology            | Purpose               |
| --------------------- | --------------------- |
| **Node.js**           | Runtime environment   |
| **Express.js**        | Web framework         |
| **MongoDB**           | NoSQL database        |
| **Mongoose**          | MongoDB ODM           |
| **JWT**               | Authentication tokens |
| **bcryptjs**          | Password hashing      |
| **OpenAI API**        | AI plan generation    |
| **Nodemailer**        | Email notifications   |
| **Multer**            | File uploads          |
| **Express Validator** | Input validation      |
| **Helmet**            | Security headers      |
| **CORS**              | Cross-origin requests |
| **Morgan**            | HTTP request logging  |

---

## Project Structure

```
cobios-backend/
├── src/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   ├── env.js                # Environment config
│   │   └── cors.js               # CORS configuration
│   │
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Membership.js         # Membership plans schema
│   │   ├── Payment.js            # Payment transactions schema
│   │   ├── WorkoutPlan.js        # Workout plans schema
│   │   ├── DietPlan.js           # Diet plans schema
│   │   ├── Progress.js           # Progress tracking schema
│   │   ├── Attendance.js         # Attendance records schema
│   │   ├── Feedback.js           # Feedback schema
│   │   ├── Notification.js       # Notifications schema
│   │   └── RefreshToken.js       # Refresh tokens schema
│   │
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── userController.js     # User CRUD operations
│   │   ├── memberController.js   # Member-specific operations
│   │   ├── trainerController.js  # Trainer-specific operations
│   │   ├── membershipController.js
│   │   ├── paymentController.js
│   │   ├── workoutController.js
│   │   ├── dietController.js
│   │   ├── progressController.js
│   │   ├── attendanceController.js
│   │   ├── feedbackController.js
│   │   ├── notificationController.js
│   │   └── aiController.js       # AI plan generation
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── memberRoutes.js
│   │   ├── trainerRoutes.js
│   │   ├── membershipRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── workoutRoutes.js
│   │   ├── dietRoutes.js
│   │   ├── progressRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── aiRoutes.js
│   │
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── roleGuard.js          # Role-based access control
│   │   ├── validate.js           # Request validation
│   │   ├── errorHandler.js       # Global error handler
│   │   └── rateLimiter.js        # Rate limiting
│   │
│   ├── services/
│   │   ├── authService.js        # Authentication business logic
│   │   ├── tokenService.js       # JWT token management
│   │   ├── emailService.js       # Email sending
│   │   ├── aiService.js          # OpenAI integration
│   │   └── paymentService.js     # Payment processing
│   │
│   ├── utils/
│   │   ├── ApiError.js           # Custom error class
│   │   ├── ApiResponse.js        # Standard response format
│   │   ├── asyncHandler.js       # Async error wrapper
│   │   ├── constants.js          # App constants
│   │   └── helpers.js            # Utility functions
│   │
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── userValidator.js
│   │   ├── membershipValidator.js
│   │   ├── paymentValidator.js
│   │   └── planValidator.js
│   │
│   └── app.js                    # Express app setup
│
├── .env.example
├── .gitignore
├── package.json
└── server.js                     # Entry point
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/cobios_gym
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/cobios_gym

# JWT Configuration
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Password Hashing
BCRYPT_SALT_ROUNDS=12

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# OpenAI Configuration (for AI Plan Generation)
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

---

## Database Schema

### 1. User Schema

```javascript
// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["admin", "trainer", "member"],
      default: "member",
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: function () {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.name}`;
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Trainer-specific fields
    specialization: {
      type: String,
      required: function () {
        return this.role === "trainer";
      },
    },
    experience: {
      type: Number,
      min: 0,
    },
    certifications: [
      {
        type: String,
      },
    ],
    assignedMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Member-specific fields
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    membershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Membership",
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    membershipExpiry: {
      type: Date,
    },

    // Password reset
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ trainerId: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(
    parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
  );
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data from JSON response
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
```

---

### 2. Membership Schema

```javascript
// models/Membership.js
const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Membership name is required"],
      trim: true,
      unique: true,
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1"],
    },
    durationType: {
      type: String,
      enum: ["days", "months", "years"],
      default: "months",
    },
    cost: {
      type: Number,
      required: [true, "Cost is required"],
      min: [0, "Cost cannot be negative"],
    },
    benefits: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    color: {
      type: String,
      default: "#808080",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Membership", membershipSchema);
```

---

### 3. Payment Schema

```javascript
// models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    membershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Membership",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: [
        "Credit Card",
        "Debit Card",
        "Cash",
        "Online",
        "UPI",
        "Bank Transfer",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    invoiceNumber: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Auto-generate invoice number
paymentSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

// Index for faster queries
paymentSchema.index({ memberId: 1, paymentDate: -1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
```

---

### 4. Workout Plan Schema

```javascript
// models/WorkoutPlan.js
const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sets: {
      type: Number,
      required: true,
      min: 1,
    },
    reps: {
      type: String,
      required: true,
    },
    rest: {
      type: String,
      default: "60s",
    },
  },
  { _id: false }
);

const dayScheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },
    focus: {
      type: String,
      required: true,
    },
    exercises: [exerciseSchema],
  },
  { _id: false }
);

const workoutPlanSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planName: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
    },
    goal: {
      type: String,
      required: [true, "Goal is required"],
    },
    duration: {
      type: String,
      required: true,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    schedule: [dayScheduleSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
workoutPlanSchema.index({ memberId: 1, isActive: 1 });
workoutPlanSchema.index({ trainerId: 1 });

module.exports = mongoose.model("WorkoutPlan", workoutPlanSchema);
```

---

### 5. Diet Plan Schema

```javascript
// models/DietPlan.js
const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema(
  {
    food: {
      type: String,
      required: true,
    },
    quantity: {
      type: String,
      required: true,
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    protein: {
      type: String,
    },
  },
  { _id: false }
);

const mealSchema = new mongoose.Schema(
  {
    meal: {
      type: String,
      enum: [
        "Breakfast",
        "Mid-Morning Snack",
        "Lunch",
        "Afternoon Snack",
        "Dinner",
        "Post-Workout",
      ],
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    items: [foodItemSchema],
    totalCalories: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const dietPlanSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planName: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
    },
    goal: {
      type: String,
      required: [true, "Goal is required"],
    },
    dailyCalories: {
      type: Number,
      required: true,
      min: [1000, "Daily calories should be at least 1000"],
    },
    macros: {
      protein: { type: String, default: "30%" },
      carbs: { type: String, default: "45%" },
      fats: { type: String, default: "25%" },
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    meals: [mealSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
dietPlanSchema.index({ memberId: 1, isActive: 1 });
dietPlanSchema.index({ trainerId: 1 });

module.exports = mongoose.model("DietPlan", dietPlanSchema);
```

---

### 6. Progress Schema

```javascript
// models/Progress.js
const mongoose = require("mongoose");

const progressRecordSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    weight: {
      type: Number,
      required: true,
      min: [20, "Weight must be at least 20 kg"],
    },
    bmi: {
      type: Number,
      min: 0,
    },
    bodyFat: {
      type: Number,
      min: 0,
      max: 100,
    },
    muscleMass: {
      type: Number,
      min: 0,
    },
  },
  { _id: true }
);

const progressSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    records: [progressRecordSchema],
  },
  { timestamps: true }
);

// Index for faster queries
progressSchema.index({ memberId: 1 });

module.exports = mongoose.model("Progress", progressSchema);
```

---

### 7. Attendance Schema

```javascript
// models/Attendance.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    checkIn: {
      type: String,
      required: true,
    },
    checkOut: {
      type: String,
    },
    duration: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate attendance on same day
attendanceSchema.index({ memberId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
```

---

### 8. Feedback Schema

```javascript
// models/Feedback.js
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    category: {
      type: String,
      enum: ["trainer", "facility", "service", "general"],
      default: "general",
    },
  },
  { timestamps: true }
);

// Index for faster queries
feedbackSchema.index({ memberId: 1 });
feedbackSchema.index({ trainerId: 1 });
feedbackSchema.index({ category: 1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
```

---

### 9. Notification Schema

```javascript
// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "membership",
        "payment",
        "plan",
        "feedback",
        "achievement",
        "admin",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    read: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
  },
  { timestamps: true }
);

// Index for faster queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
```

---

### 10. Refresh Token Schema

```javascript
// models/RefreshToken.js
const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    userAgent: String,
    ipAddress: String,
  },
  { timestamps: true }
);

// TTL index to automatically delete expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ userId: 1 });

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
```

---

## Authentication & Authorization

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION FLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. LOGIN                                                                │
│     ┌──────────┐    POST /auth/login    ┌──────────┐                    │
│     │  Client  │ ─────────────────────► │  Server  │                    │
│     └──────────┘   {email, password}    └──────────┘                    │
│          │                                    │                          │
│          │         ◄──────────────────────────┤                          │
│          │         {accessToken, refreshToken}│                          │
│                                                                          │
│  2. PROTECTED REQUEST                                                    │
│     ┌──────────┐    Authorization: Bearer <accessToken>                 │
│     │  Client  │ ─────────────────────────────────────► Protected Route │
│     └──────────┘                                                        │
│                                                                          │
│  3. TOKEN REFRESH (when access token expires)                           │
│     ┌──────────┐    POST /auth/refresh    ┌──────────┐                  │
│     │  Client  │ ──────────────────────► │  Server  │                   │
│     └──────────┘    {refreshToken}        └──────────┘                  │
│          │                                     │                         │
│          │          ◄──────────────────────────┤                         │
│          │          {newAccessToken}           │                         │
│                                                                          │
│  4. LOGOUT                                                               │
│     ┌──────────┐    POST /auth/logout     ┌──────────┐                  │
│     │  Client  │ ──────────────────────► │  Server  │                   │
│     └──────────┘    {refreshToken}        └──────────┘                  │
│                     (Revoke token in DB)                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Token Service Implementation

```javascript
// services/tokenService.js
const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");

class TokenService {
  // Generate Access Token (short-lived: 15 minutes)
  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m" }
    );
  }

  // Generate Refresh Token (long-lived: 7 days)
  async generateRefreshToken(user, userAgent, ipAddress) {
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d" }
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
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  }

  // Verify Refresh Token
  async verifyRefreshToken(token) {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

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
```

### Password Hashing

Password hashing is automatically handled in the User model using bcryptjs:

```javascript
// In User model (pre-save hook)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Generate salt with configurable rounds (default: 12)
  const salt = await bcrypt.genSalt(
    parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
  );
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

### Auth Controller

```javascript
// controllers/authController.js
const User = require("../models/User");
const tokenService = require("../services/tokenService");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

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
```

### Role-Based Access Control Middleware

```javascript
// middleware/roleGuard.js
const ApiError = require("../utils/ApiError");

const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "Access denied. Insufficient permissions"));
    }

    next();
  };
};

module.exports = roleGuard;
```

---

## API Endpoints

### Authentication Routes

| Method | Endpoint                          | Description            | Access        |
| ------ | --------------------------------- | ---------------------- | ------------- |
| POST   | `/api/auth/login`                 | User login             | Public        |
| POST   | `/api/auth/register`              | User registration      | Public        |
| POST   | `/api/auth/refresh`               | Refresh access token   | Public        |
| POST   | `/api/auth/logout`                | User logout            | Authenticated |
| POST   | `/api/auth/forgot-password`       | Request password reset | Public        |
| POST   | `/api/auth/reset-password/:token` | Reset password         | Public        |
| GET    | `/api/auth/me`                    | Get current user       | Authenticated |

---

### User Routes (Admin Only)

| Method | Endpoint                | Description               | Access |
| ------ | ----------------------- | ------------------------- | ------ |
| GET    | `/api/users`            | Get all users             | Admin  |
| GET    | `/api/users/:id`        | Get user by ID            | Admin  |
| POST   | `/api/users`            | Create new user           | Admin  |
| PUT    | `/api/users/:id`        | Update user               | Admin  |
| DELETE | `/api/users/:id`        | Delete user (soft delete) | Admin  |
| PATCH  | `/api/users/:id/status` | Toggle user active status | Admin  |

---

### Member Routes

| Method | Endpoint                      | Description           | Access               |
| ------ | ----------------------------- | --------------------- | -------------------- |
| GET    | `/api/members`                | Get all members       | Admin, Trainer       |
| GET    | `/api/members/:id`            | Get member by ID      | Admin, Trainer, Self |
| POST   | `/api/members`                | Create new member     | Admin                |
| PUT    | `/api/members/:id`            | Update member         | Admin, Self          |
| DELETE | `/api/members/:id`            | Delete member         | Admin                |
| GET    | `/api/members/:id/progress`   | Get member progress   | Admin, Trainer, Self |
| GET    | `/api/members/:id/plans`      | Get member plans      | Admin, Trainer, Self |
| GET    | `/api/members/:id/attendance` | Get member attendance | Admin, Trainer, Self |

---

### Trainer Routes

| Method | Endpoint                                      | Description                    | Access      |
| ------ | --------------------------------------------- | ------------------------------ | ----------- |
| GET    | `/api/trainers`                               | Get all trainers               | Admin       |
| GET    | `/api/trainers/:id`                           | Get trainer by ID              | Admin, Self |
| POST   | `/api/trainers`                               | Create new trainer             | Admin       |
| PUT    | `/api/trainers/:id`                           | Update trainer                 | Admin, Self |
| DELETE | `/api/trainers/:id`                           | Delete trainer                 | Admin       |
| GET    | `/api/trainers/:id/members`                   | Get trainer's assigned members | Admin, Self |
| POST   | `/api/trainers/:id/assign-member`             | Assign member to trainer       | Admin       |
| DELETE | `/api/trainers/:id/unassign-member/:memberId` | Unassign member                | Admin       |

---

### Membership Routes

| Method | Endpoint                      | Description              | Access |
| ------ | ----------------------------- | ------------------------ | ------ |
| GET    | `/api/memberships`            | Get all membership plans | Public |
| GET    | `/api/memberships/:id`        | Get membership by ID     | Public |
| POST   | `/api/memberships`            | Create new membership    | Admin  |
| PUT    | `/api/memberships/:id`        | Update membership        | Admin  |
| DELETE | `/api/memberships/:id`        | Delete membership        | Admin  |
| PATCH  | `/api/memberships/:id/status` | Toggle membership status | Admin  |

---

### Payment Routes

| Method | Endpoint                         | Description            | Access      |
| ------ | -------------------------------- | ---------------------- | ----------- |
| GET    | `/api/payments`                  | Get all payments       | Admin       |
| GET    | `/api/payments/:id`              | Get payment by ID      | Admin, Self |
| POST   | `/api/payments`                  | Create new payment     | Admin       |
| PUT    | `/api/payments/:id`              | Update payment         | Admin       |
| DELETE | `/api/payments/:id`              | Delete payment         | Admin       |
| GET    | `/api/payments/member/:memberId` | Get member's payments  | Admin, Self |
| GET    | `/api/payments/stats`            | Get payment statistics | Admin       |
| PATCH  | `/api/payments/:id/status`       | Update payment status  | Admin       |

---

### Workout Plan Routes

| Method | Endpoint                              | Description              | Access                       |
| ------ | ------------------------------------- | ------------------------ | ---------------------------- |
| GET    | `/api/workout-plans`                  | Get all workout plans    | Admin                        |
| GET    | `/api/workout-plans/:id`              | Get plan by ID           | Admin, Trainer, Member (own) |
| POST   | `/api/workout-plans`                  | Create new plan          | Admin, Trainer               |
| PUT    | `/api/workout-plans/:id`              | Update plan              | Admin, Trainer               |
| DELETE | `/api/workout-plans/:id`              | Delete plan              | Admin, Trainer               |
| GET    | `/api/workout-plans/member/:memberId` | Get member's plans       | Admin, Trainer, Self         |
| POST   | `/api/workout-plans/generate`         | Generate AI workout plan | Admin, Trainer               |

---

### Diet Plan Routes

| Method | Endpoint                           | Description           | Access                       |
| ------ | ---------------------------------- | --------------------- | ---------------------------- |
| GET    | `/api/diet-plans`                  | Get all diet plans    | Admin                        |
| GET    | `/api/diet-plans/:id`              | Get plan by ID        | Admin, Trainer, Member (own) |
| POST   | `/api/diet-plans`                  | Create new plan       | Admin, Trainer               |
| PUT    | `/api/diet-plans/:id`              | Update plan           | Admin, Trainer               |
| DELETE | `/api/diet-plans/:id`              | Delete plan           | Admin, Trainer               |
| GET    | `/api/diet-plans/member/:memberId` | Get member's plans    | Admin, Trainer, Self         |
| POST   | `/api/diet-plans/generate`         | Generate AI diet plan | Admin, Trainer               |

---

### Progress Routes

| Method | Endpoint                                   | Description              | Access               |
| ------ | ------------------------------------------ | ------------------------ | -------------------- |
| GET    | `/api/progress`                            | Get all progress records | Admin                |
| GET    | `/api/progress/member/:memberId`           | Get member's progress    | Admin, Trainer, Self |
| POST   | `/api/progress/:memberId/record`           | Add progress record      | Admin, Trainer, Self |
| PUT    | `/api/progress/:memberId/record/:recordId` | Update progress record   | Admin, Trainer       |
| DELETE | `/api/progress/:memberId/record/:recordId` | Delete progress record   | Admin                |

---

### Attendance Routes

| Method | Endpoint                           | Description               | Access               |
| ------ | ---------------------------------- | ------------------------- | -------------------- |
| GET    | `/api/attendance`                  | Get all attendance        | Admin                |
| GET    | `/api/attendance/member/:memberId` | Get member's attendance   | Admin, Trainer, Self |
| POST   | `/api/attendance/check-in`         | Member check-in           | Member               |
| POST   | `/api/attendance/check-out`        | Member check-out          | Member               |
| GET    | `/api/attendance/today`            | Get today's attendance    | Admin, Trainer       |
| GET    | `/api/attendance/stats`            | Get attendance statistics | Admin                |

---

### Feedback Routes

| Method | Endpoint                           | Description             | Access               |
| ------ | ---------------------------------- | ----------------------- | -------------------- |
| GET    | `/api/feedback`                    | Get all feedback        | Admin                |
| GET    | `/api/feedback/:id`                | Get feedback by ID      | Admin                |
| POST   | `/api/feedback`                    | Submit feedback         | Member               |
| DELETE | `/api/feedback/:id`                | Delete feedback         | Admin                |
| GET    | `/api/feedback/trainer/:trainerId` | Get trainer's feedback  | Admin, Trainer (own) |
| GET    | `/api/feedback/member/:memberId`   | Get member's feedback   | Admin, Self          |
| GET    | `/api/feedback/stats`              | Get feedback statistics | Admin                |

---

### Notification Routes

| Method | Endpoint                      | Description                  | Access        |
| ------ | ----------------------------- | ---------------------------- | ------------- |
| GET    | `/api/notifications`          | Get user's notifications     | Authenticated |
| GET    | `/api/notifications/unread`   | Get unread notifications     | Authenticated |
| PATCH  | `/api/notifications/:id/read` | Mark as read                 | Authenticated |
| PATCH  | `/api/notifications/read-all` | Mark all as read             | Authenticated |
| DELETE | `/api/notifications/:id`      | Delete notification          | Authenticated |
| POST   | `/api/notifications`          | Create notification (system) | Admin         |

---

### AI Routes

| Method | Endpoint                        | Description              | Access         |
| ------ | ------------------------------- | ------------------------ | -------------- |
| POST   | `/api/ai/generate-workout-plan` | Generate AI workout plan | Admin, Trainer |
| POST   | `/api/ai/generate-diet-plan`    | Generate AI diet plan    | Admin, Trainer |
| POST   | `/api/ai/request-plan`          | Member request AI plan   | Member         |

---

## AI Integration

### AI Service Implementation

```javascript
// services/aiService.js
const { OpenAI } = require("openai");

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateWorkoutPlan(userDetails) {
    const {
      age,
      height,
      weight,
      fitnessLevel,
      goal,
      medicalConditions,
      workoutDaysPerWeek,
      preferredWorkoutTime,
    } = userDetails;

    const prompt = `
    Create a detailed workout plan for a gym member with the following profile:
    
    - Age: ${age} years
    - Height: ${height} cm
    - Weight: ${weight} kg
    - Fitness Level: ${fitnessLevel}
    - Goal: ${goal}
    - Medical Conditions: ${medicalConditions || "None"}
    - Workout Days Per Week: ${workoutDaysPerWeek}
    - Preferred Workout Time: ${preferredWorkoutTime}
    
    Generate a structured weekly workout plan with:
    1. Day-wise schedule (${workoutDaysPerWeek} workout days + rest days)
    2. For each day: focus area, exercises with sets, reps, and rest periods
    3. Consider the fitness level and any medical conditions
    4. Progressive difficulty appropriate for the goal
    
    Return the response in the following JSON format:
    {
      "planName": "string",
      "goal": "string",
      "duration": "string (e.g., '12 weeks')",
      "schedule": [
        {
          "day": "Monday|Tuesday|...",
          "focus": "string (e.g., 'Chest & Triceps')",
          "exercises": [
            {
              "name": "string",
              "sets": number,
              "reps": "string (e.g., '8-10')",
              "rest": "string (e.g., '60s')"
            }
          ]
        }
      ]
    }
    `;

    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert fitness trainer and exercise physiologist. Generate detailed, safe, and effective workout plans based on user profiles.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  async generateDietPlan(userDetails) {
    const {
      age,
      height,
      weight,
      fitnessLevel,
      goal,
      dietaryRestrictions,
      medicalConditions,
    } = userDetails;

    // Calculate BMR and daily calorie needs
    const bmr = this.calculateBMR(weight, height, age);
    const targetCalories = this.calculateTargetCalories(
      bmr,
      fitnessLevel,
      goal
    );

    const prompt = `
    Create a detailed diet plan for a person with the following profile:
    
    - Age: ${age} years
    - Height: ${height} cm
    - Weight: ${weight} kg
    - Fitness Level: ${fitnessLevel}
    - Goal: ${goal}
    - Dietary Restrictions: ${dietaryRestrictions || "None"}
    - Medical Conditions: ${medicalConditions || "None"}
    - Target Daily Calories: ~${targetCalories} kcal
    
    Generate a structured daily diet plan with:
    1. 5-6 meals throughout the day
    2. Each meal with food items, quantities, calories, and protein content
    3. Macronutrient distribution (protein, carbs, fats percentages)
    4. Consider dietary restrictions and medical conditions
    
    Return the response in the following JSON format:
    {
      "planName": "string",
      "goal": "string",
      "dailyCalories": number,
      "macros": {
        "protein": "string (e.g., '35%')",
        "carbs": "string",
        "fats": "string"
      },
      "meals": [
        {
          "meal": "Breakfast|Mid-Morning Snack|Lunch|Afternoon Snack|Dinner|Post-Workout",
          "time": "string (e.g., '7:00 AM')",
          "items": [
            {
              "food": "string",
              "quantity": "string",
              "calories": number,
              "protein": "string"
            }
          ],
          "totalCalories": number
        }
      ]
    }
    `;

    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert nutritionist and dietitian. Generate detailed, balanced, and healthy diet plans based on user profiles and goals.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  // Calculate Basal Metabolic Rate (Mifflin-St Jeor Equation)
  calculateBMR(weight, height, age, gender = "male") {
    if (gender === "male") {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    } else {
      return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    }
  }

  // Calculate target calories based on activity and goal
  calculateTargetCalories(bmr, fitnessLevel, goal) {
    const activityMultipliers = {
      beginner: 1.375, // Light activity
      intermediate: 1.55, // Moderate activity
      advanced: 1.725, // Very active
    };

    const tdee = bmr * (activityMultipliers[fitnessLevel] || 1.55);

    // Adjust based on goal
    if (
      goal.toLowerCase().includes("muscle") ||
      goal.toLowerCase().includes("bulk")
    ) {
      return Math.round(tdee + 300); // Caloric surplus
    } else if (
      goal.toLowerCase().includes("weight loss") ||
      goal.toLowerCase().includes("lose")
    ) {
      return Math.round(tdee - 500); // Caloric deficit
    }

    return Math.round(tdee); // Maintenance
  }
}

module.exports = new AIService();
```

### AI Controller

```javascript
// controllers/aiController.js
const aiService = require("../services/aiService");
const WorkoutPlan = require("../models/WorkoutPlan");
const DietPlan = require("../models/DietPlan");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

exports.generateWorkoutPlan = asyncHandler(async (req, res) => {
  const {
    memberId,
    age,
    height,
    weight,
    fitnessLevel,
    goal,
    medicalConditions,
    workoutDaysPerWeek,
    preferredWorkoutTime,
  } = req.body;

  // Generate AI workout plan
  const aiPlan = await aiService.generateWorkoutPlan({
    age,
    height,
    weight,
    fitnessLevel,
    goal,
    medicalConditions,
    workoutDaysPerWeek,
    preferredWorkoutTime,
  });

  // Save workout plan to database
  const workoutPlan = await WorkoutPlan.create({
    memberId,
    trainerId: req.user.userId,
    planName: aiPlan.planName,
    goal: aiPlan.goal,
    duration: aiPlan.duration,
    schedule: aiPlan.schedule,
    aiGenerated: true,
  });

  // Create notification for member
  await Notification.create({
    userId: memberId,
    type: "plan",
    title: "New Workout Plan Available",
    message: `Your AI-generated workout plan "${aiPlan.planName}" is ready!`,
    priority: "medium",
  });

  res.status(201).json({
    success: true,
    message: "Workout plan generated successfully",
    data: workoutPlan,
  });
});

exports.generateDietPlan = asyncHandler(async (req, res) => {
  const {
    memberId,
    age,
    height,
    weight,
    fitnessLevel,
    goal,
    dietaryRestrictions,
    medicalConditions,
  } = req.body;

  // Generate AI diet plan
  const aiPlan = await aiService.generateDietPlan({
    age,
    height,
    weight,
    fitnessLevel,
    goal,
    dietaryRestrictions,
    medicalConditions,
  });

  // Save diet plan to database
  const dietPlan = await DietPlan.create({
    memberId,
    trainerId: req.user.userId,
    planName: aiPlan.planName,
    goal: aiPlan.goal,
    dailyCalories: aiPlan.dailyCalories,
    macros: aiPlan.macros,
    meals: aiPlan.meals,
    aiGenerated: true,
  });

  // Create notification for member
  await Notification.create({
    userId: memberId,
    type: "plan",
    title: "New Diet Plan Available",
    message: `Your AI-generated diet plan "${aiPlan.planName}" is ready!`,
    priority: "medium",
  });

  res.status(201).json({
    success: true,
    message: "Diet plan generated successfully",
    data: dietPlan,
  });
});

// Member requests AI plan generation
exports.requestAIPlan = asyncHandler(async (req, res) => {
  const { trainerId, ...planDetails } = req.body;
  const memberId = req.user.userId;

  // Create notification for trainer
  await Notification.create({
    userId: trainerId,
    type: "plan",
    title: "AI Plan Generation Request",
    message: `Member has requested AI-generated workout and diet plans. Please review their details and generate the plans.`,
    priority: "high",
  });

  res.status(200).json({
    success: true,
    message:
      "Your AI plan generation request has been submitted. Your trainer will review and assign your personalized plans soon.",
  });
});
```

---

## Middleware

### Authentication Middleware

```javascript
// middleware/auth.js
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
```

### Rate Limiter

```javascript
// middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limiter
exports.apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  "Too many requests, please try again later."
);

// Auth routes rate limiter (stricter)
exports.authLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5, // 5 attempts per hour
  "Too many login attempts, please try again after an hour."
);

// AI generation rate limiter
exports.aiLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // 10 AI generations per hour
  "AI generation limit reached, please try again later."
);
```

---

## Error Handling

### Custom Error Class

```javascript
// utils/ApiError.js
class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
```

### Global Error Handler

```javascript
// middleware/errorHandler.js
const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  let error = err;

  // If it's not an ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, [], err.stack);
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ApiError(400, `${field} already exists`);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, "Validation Error", errors);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    error = new ApiError(400, "Invalid ID format");
  }

  const response = {
    success: false,
    message: error.message,
    ...(error.errors.length && { errors: error.errors }),
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
```

---

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher) OR MongoDB Atlas account
- OpenAI API key (for AI features)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/ankitXD/cobios-backend.git
cd cobios-backend

# Install dependencies
npm install
```

### Step 2: Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configurations
# (MongoDB URI, JWT secrets, OpenAI API key, etc.)
```

### Step 3: Database Setup

```bash
# If using local MongoDB, start MongoDB service
mongod

# Seed initial data (optional)
npm run seed
```

### Step 4: Run the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

### Step 5: Verify Installation

```bash
# The server should start on http://localhost:5000
# Test the health endpoint
curl http://localhost:5000/api/health
```

---

## User Flow Summary

### Admin Flow

1. Login → Admin Dashboard
2. Manage Members (CRUD operations)
3. Manage Trainers (CRUD operations)
4. Manage Memberships & Payments
5. View Feedback & Analytics
6. System Settings

### Trainer Flow

1. Login → Trainer Dashboard
2. View Assigned Members
3. Create/Manage Workout Plans
4. Create/Manage Diet Plans
5. Track Member Progress
6. View Schedule & Attendance
7. Receive & Respond to Feedback

### Member Flow

1. Login → Member Dashboard
2. View Workout & Diet Plans
3. Track Progress
4. Check-in/Check-out (Attendance)
5. View Membership Details
6. Submit Feedback
7. Request AI-Generated Plans

---

## Security Best Practices

1. **Password Security**: bcrypt with 12+ salt rounds
2. **JWT Tokens**: Short-lived access tokens (15 min) + Refresh token rotation
3. **Rate Limiting**: Prevent brute force attacks
4. **Input Validation**: Express-validator for all inputs
5. **CORS**: Restricted to allowed origins
6. **Helmet**: Security headers enabled
7. **MongoDB Injection**: Mongoose sanitization
8. **XSS Protection**: Data sanitization on input/output

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues and feature requests, please open an issue on GitHub.
