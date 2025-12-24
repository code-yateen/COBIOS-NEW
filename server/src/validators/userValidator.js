const { body, param } = require("express-validator");

exports.createUserValidator = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters"),
  body("role")
    .isIn(["admin", "trainer", "member"])
    .withMessage("Invalid role"),
  body("phone").optional().trim(),
];

exports.updateUserValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters"),
  body("phone").optional().trim(),
  body("role")
    .optional()
    .isIn(["admin", "trainer", "member"])
    .withMessage("Invalid role"),
];

exports.userIdValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid user ID format"),
];

