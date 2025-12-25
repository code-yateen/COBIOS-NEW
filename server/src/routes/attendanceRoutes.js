const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");
const validate = require("../middleware/validate");
const { param } = require("express-validator");

const memberIdValidator = [
  param("memberId").isMongoId().withMessage("Invalid member ID format"),
];

router.use(auth);

router.get("/", roleGuard("admin"), attendanceController.getAllAttendance);
router.get("/today", roleGuard("admin", "trainer"), attendanceController.getTodayAttendance);
router.get("/stats", roleGuard("admin"), attendanceController.getAttendanceStats);
router.get("/member/:memberId", memberIdValidator, validate, attendanceController.getMemberAttendance);
router.post("/check-in", roleGuard("member"), attendanceController.checkIn);
router.post("/check-out", roleGuard("member"), attendanceController.checkOut);

module.exports = router;

