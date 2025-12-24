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

