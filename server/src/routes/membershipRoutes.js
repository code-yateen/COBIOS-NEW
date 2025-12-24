const express = require("express");
const router = express.Router();
const membershipController = require("../controllers/membershipController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");
const validate = require("../middleware/validate");
const {
  createMembershipValidator,
  updateMembershipValidator,
  membershipIdValidator,
} = require("../validators/membershipValidator");

// Public routes
router.get("/", membershipController.getAllMemberships);
router.get("/:id", membershipIdValidator, validate, membershipController.getMembershipById);

// Admin only routes
router.use(auth);
router.use(roleGuard("admin"));

router.post("/", createMembershipValidator, validate, membershipController.createMembership);
router.put("/:id", membershipIdValidator, updateMembershipValidator, validate, membershipController.updateMembership);
router.delete("/:id", membershipIdValidator, validate, membershipController.deleteMembership);
router.patch("/:id/status", membershipIdValidator, validate, membershipController.toggleMembershipStatus);

module.exports = router;

