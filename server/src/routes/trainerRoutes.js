const express = require("express");
const router = express.Router();
const trainerController = require("../controllers/trainerController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");
const validate = require("../middleware/validate");
const { param } = require("express-validator");

const trainerIdValidator = [
  param("id").isMongoId().withMessage("Invalid trainer ID format"),
];

const memberIdValidator = [
  param("memberId").isMongoId().withMessage("Invalid member ID format"),
];

router.use(auth);

router.get("/", roleGuard("admin"), trainerController.getAllTrainers);
router.get("/:id", trainerIdValidator, validate, trainerController.getTrainerById);
router.post("/", roleGuard("admin"), trainerController.createTrainer);
router.put("/:id", trainerIdValidator, validate, trainerController.updateTrainer);
router.delete("/:id", roleGuard("admin"), trainerIdValidator, validate, trainerController.deleteTrainer);
router.get("/:id/members", trainerIdValidator, validate, trainerController.getTrainerMembers);
router.post("/:id/assign-member", roleGuard("admin"), trainerIdValidator, validate, trainerController.assignMember);
router.delete("/:id/unassign-member/:memberId", roleGuard("admin"), trainerIdValidator, memberIdValidator, validate, trainerController.unassignMember);

module.exports = router;

