const { body, param } = require("express-validator");

exports.createPaymentValidator = [
  body("memberId")
    .isMongoId()
    .withMessage("Invalid member ID format"),
  body("membershipId")
    .isMongoId()
    .withMessage("Invalid membership ID format"),
  body("amount")
    .isFloat({ min: 0 })
    .withMessage("Amount cannot be negative"),
  body("paymentMethod")
    .isIn([
      "Credit Card",
      "Debit Card",
      "Cash",
      "Online",
      "UPI",
      "Bank Transfer",
    ])
    .withMessage("Invalid payment method"),
  body("status")
    .optional()
    .isIn(["pending", "completed", "failed", "refunded"]),
];

exports.updatePaymentValidator = [
  body("status")
    .optional()
    .isIn(["pending", "completed", "failed", "refunded"]),
  body("amount").optional().isFloat({ min: 0 }),
];

exports.paymentIdValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid payment ID format"),
];

