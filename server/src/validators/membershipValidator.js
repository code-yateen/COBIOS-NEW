const { body, param } = require("express-validator");

exports.createMembershipValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Membership name is required"),
  body("duration")
    .isInt({ min: 1 })
    .withMessage("Duration must be at least 1"),
  body("durationType")
    .isIn(["days", "months", "years"])
    .withMessage("Invalid duration type"),
  body("cost")
    .isFloat({ min: 0 })
    .withMessage("Cost cannot be negative"),
  body("benefits")
    .optional()
    .isArray()
    .withMessage("Benefits must be an array"),
  body("color").optional().isString(),
];

exports.updateMembershipValidator = [
  body("name").optional().trim(),
  body("duration").optional().isInt({ min: 1 }),
  body("durationType")
    .optional()
    .isIn(["days", "months", "years"]),
  body("cost").optional().isFloat({ min: 0 }),
  body("benefits").optional().isArray(),
  body("status")
    .optional()
    .isIn(["active", "inactive"]),
  body("color").optional().isString(),
];

exports.membershipIdValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid membership ID format"),
];

