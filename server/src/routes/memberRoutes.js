const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");
const validate = require("../middleware/validate");
const { param } = require("express-validator");

const memberIdValidator = [
  param("id").isMongoId().withMessage("Invalid member ID format"),
];

router.use(auth);

router.get(
  "/",
  roleGuard("admin", "trainer"),
  memberController.getAllMembers
);
router.get(
  "/:id",
  memberIdValidator,
  validate,
  memberController.getMemberById
);
router.post(
  "/",
  roleGuard("admin"),
  memberController.createMember
);
router.put(
  "/:id",
  memberIdValidator,
  validate,
  memberController.updateMember
);
router.delete(
  "/:id",
  roleGuard("admin"),
  memberIdValidator,
  validate,
  memberController.deleteMember
);
router.get(
  "/:id/progress",
  memberIdValidator,
  validate,
  memberController.getMemberProgress
);
router.get(
  "/:id/plans",
  memberIdValidator,
  validate,
  memberController.getMemberPlans
);
router.get(
  "/:id/attendance",
  memberIdValidator,
  validate,
  memberController.getMemberAttendance
);

module.exports = router;

