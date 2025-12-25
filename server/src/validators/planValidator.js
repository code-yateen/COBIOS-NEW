const { body, param } = require("express-validator");

exports.createWorkoutPlanValidator = [
  body("memberId")
    .isMongoId()
    .withMessage("Invalid member ID format"),
  body("planName")
    .trim()
    .notEmpty()
    .withMessage("Plan name is required"),
  body("goal")
    .trim()
    .notEmpty()
    .withMessage("Goal is required"),
  body("duration")
    .trim()
    .notEmpty()
    .withMessage("Duration is required"),
  body("schedule")
    .isArray()
    .withMessage("Schedule must be an array"),
];

exports.createDietPlanValidator = [
  body("memberId")
    .isMongoId()
    .withMessage("Invalid member ID format"),
  body("planName")
    .trim()
    .notEmpty()
    .withMessage("Plan name is required"),
  body("goal")
    .trim()
    .notEmpty()
    .withMessage("Goal is required"),
  body("dailyCalories")
    .isInt({ min: 1000 })
    .withMessage("Daily calories should be at least 1000"),
  body("meals")
    .isArray()
    .withMessage("Meals must be an array"),
];

exports.generateWorkoutPlanValidator = [
  body("memberId")
    .optional()
    .isMongoId()
    .withMessage("Invalid member ID format"),
  body("age")
    .isInt({ min: 1, max: 120 })
    .withMessage("Age must be between 1 and 120"),
  body("height")
    .isFloat({ min: 50, max: 300 })
    .withMessage("Height must be between 50 and 300 cm"),
  body("weight")
    .isFloat({ min: 20, max: 500 })
    .withMessage("Weight must be between 20 and 500 kg"),
  body("fitnessLevel")
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Invalid fitness level"),
  body("goal")
    .trim()
    .notEmpty()
    .withMessage("Goal is required"),
  body("workoutDaysPerWeek")
    .isInt({ min: 1, max: 7 })
    .withMessage("Workout days must be between 1 and 7"),
];

exports.generateDietPlanValidator = [
  body("memberId")
    .optional()
    .isMongoId()
    .withMessage("Invalid member ID format"),
  body("age")
    .isInt({ min: 1, max: 120 })
    .withMessage("Age must be between 1 and 120"),
  body("height")
    .isFloat({ min: 50, max: 300 })
    .withMessage("Height must be between 50 and 300 cm"),
  body("weight")
    .isFloat({ min: 20, max: 500 })
    .withMessage("Weight must be between 20 and 500 kg"),
  body("fitnessLevel")
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Invalid fitness level"),
  body("goal")
    .trim()
    .notEmpty()
    .withMessage("Goal is required"),
];

exports.planIdValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid plan ID format"),
];

