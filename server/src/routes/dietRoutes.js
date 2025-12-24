const express = require("express");
const router = express.Router();
const dietController = require("../controllers/dietController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");
const validate = require("../middleware/validate");
const { param } = require("express-validator");
const {
  createDietPlanValidator,
  planIdValidator,
} = require("../validators/planValidator");

router.use(auth);

router.get("/", roleGuard("admin"), dietController.getAllDietPlans);
router.get("/:id", planIdValidator, validate, dietController.getDietPlanById);
router.post("/", roleGuard("admin", "trainer"), createDietPlanValidator, validate, dietController.createDietPlan);
router.put("/:id", roleGuard("admin", "trainer"), planIdValidator, validate, dietController.updateDietPlan);
router.delete("/:id", roleGuard("admin", "trainer"), planIdValidator, validate, dietController.deleteDietPlan);
const memberIdValidator = [
  param("memberId").isMongoId().withMessage("Invalid member ID format"),
];

router.get("/member/:memberId", memberIdValidator, validate, dietController.getMemberDietPlans);

module.exports = router;

