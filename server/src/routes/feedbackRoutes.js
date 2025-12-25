const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");
const validate = require("../middleware/validate");
const { param } = require("express-validator");

const feedbackIdValidator = [
  param("id").isMongoId().withMessage("Invalid feedback ID format"),
];

const trainerIdValidator = [
  param("trainerId").isMongoId().withMessage("Invalid trainer ID format"),
];

const memberIdValidator = [
  param("memberId").isMongoId().withMessage("Invalid member ID format"),
];

router.use(auth);

router.get("/", roleGuard("admin"), feedbackController.getAllFeedback);
router.get("/stats", roleGuard("admin"), feedbackController.getFeedbackStats);
router.get("/:id", feedbackIdValidator, validate, feedbackController.getFeedbackById);
router.post("/", roleGuard("member"), feedbackController.createFeedback);
router.delete("/:id", roleGuard("admin"), feedbackIdValidator, validate, feedbackController.deleteFeedback);
router.get("/trainer/:trainerId", trainerIdValidator, validate, feedbackController.getTrainerFeedback);
router.get("/member/:memberId", memberIdValidator, validate, feedbackController.getMemberFeedback);

module.exports = router;

