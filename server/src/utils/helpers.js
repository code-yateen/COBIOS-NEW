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

/**
 * Calculate membership expiry date based on duration and durationType
 * @param {Number} duration - Duration value
 * @param {String} durationType - Type of duration: "days", "months", or "years"
 * @param {Date} startDate - Start date (defaults to current date)
 * @returns {Date} Expiry date
 */
const calculateMembershipExpiry = (duration, durationType, startDate = new Date()) => {
  const expiryDate = new Date(startDate);
  
  if (durationType === "days") {
    expiryDate.setDate(expiryDate.getDate() + duration);
  } else if (durationType === "months") {
    expiryDate.setMonth(expiryDate.getMonth() + duration);
  } else if (durationType === "years") {
    expiryDate.setFullYear(expiryDate.getFullYear() + duration);
  }
  
  return expiryDate;
};

module.exports = {
  generateToken,
  generateNumericCode,
  formatDate,
  daysBetween,
  isExpired,
  sanitizeInput,
  calculateMembershipExpiry,
};

