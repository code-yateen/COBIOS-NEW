const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");
const validate = require("../middleware/validate");
const { param } = require("express-validator");

const memberIdValidator = [
  param("memberId").isMongoId().withMessage("Invalid member ID format"),
];

const recordIdValidator = [
  param("recordId").isMongoId().withMessage("Invalid record ID format"),
];

router.use(auth);

router.get("/", roleGuard("admin"), progressController.getAllProgress);
router.get("/member/:memberId", memberIdValidator, validate, progressController.getMemberProgress);
router.post("/:memberId/record", memberIdValidator, validate, progressController.addProgressRecord);
router.put("/:memberId/record/:recordId", roleGuard("admin", "trainer"), memberIdValidator, recordIdValidator, validate, progressController.updateProgressRecord);
router.delete("/:memberId/record/:recordId", roleGuard("admin"), memberIdValidator, recordIdValidator, validate, progressController.deleteProgressRecord);

module.exports = router;

