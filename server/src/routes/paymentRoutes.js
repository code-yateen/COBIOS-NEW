const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");
const validate = require("../middleware/validate");
const { param } = require("express-validator");
const {
  createPaymentValidator,
  updatePaymentValidator,
  paymentIdValidator,
} = require("../validators/paymentValidator");

router.use(auth);

router.get("/", roleGuard("admin"), paymentController.getAllPayments);
router.get("/stats", roleGuard("admin"), paymentController.getPaymentStats);
router.get("/:id", paymentIdValidator, validate, paymentController.getPaymentById);
router.post("/", roleGuard("admin"), createPaymentValidator, validate, paymentController.createPayment);
router.put("/:id", roleGuard("admin"), paymentIdValidator, updatePaymentValidator, validate, paymentController.updatePayment);
router.delete("/:id", roleGuard("admin"), paymentIdValidator, validate, paymentController.deletePayment);
const memberIdValidator = [
  param("memberId").isMongoId().withMessage("Invalid member ID format"),
];

router.get("/member/:memberId", memberIdValidator, validate, paymentController.getMemberPayments);
router.patch("/:id/status", roleGuard("admin"), paymentIdValidator, validate, paymentController.updatePaymentStatus);

module.exports = router;

