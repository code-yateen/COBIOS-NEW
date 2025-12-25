const express = require("express");
const router = express.Router();
const workoutController = require("../controllers/workoutController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");
const validate = require("../middleware/validate");
const { param } = require("express-validator");
const {
  createWorkoutPlanValidator,
  planIdValidator,
} = require("../validators/planValidator");

router.use(auth);

router.get("/", roleGuard("admin"), workoutController.getAllWorkoutPlans);
router.get("/:id", planIdValidator, validate, workoutController.getWorkoutPlanById);
router.post("/", roleGuard("admin", "trainer"), createWorkoutPlanValidator, validate, workoutController.createWorkoutPlan);
router.put("/:id", roleGuard("admin", "trainer"), planIdValidator, validate, workoutController.updateWorkoutPlan);
router.delete("/:id", roleGuard("admin", "trainer"), planIdValidator, validate, workoutController.deleteWorkoutPlan);
const memberIdValidator = [
  param("memberId").isMongoId().withMessage("Invalid member ID format"),
];

router.get("/member/:memberId", memberIdValidator, validate, workoutController.getMemberWorkoutPlans);

module.exports = router;

