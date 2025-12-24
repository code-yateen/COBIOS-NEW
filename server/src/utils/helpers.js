const crypto = require("crypto");

/**
 * Generate a random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Generate a random numeric code
 */
const generateNumericCode = (length = 6) => {
  return Math.floor(
    Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
  ).toString();
};

/**
 * Format date to readable string
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Calculate days between two dates
 */
const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
};

/**
 * Check if date is expired
 */
const isExpired = (date) => {
  return new Date(date) < new Date();
};

/**
 * Sanitize string input
 */
const sanitizeInput = (str) => {
  if (typeof str !== "string") return str;
  return str.trim().replace(/[<>]/g, "");
};

module.exports = {
  generateToken,
  generateNumericCode,
  formatDate,
  daysBetween,
  isExpired,
  sanitizeInput,
};

