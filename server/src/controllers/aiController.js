const aiService = require("../services/aiService");
const WorkoutPlan = require("../models/WorkoutPlan");
const DietPlan = require("../models/DietPlan");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { normalizeMeal, normalizeMealData, normalizeFoodItem } = require("../utils/aiNormalizers");


exports.generateWorkoutPlan = asyncHandler(async (req, res) => {
  const {
    memberId,
    age,
    height,
    weight,
    fitnessLevel,
    goal,
    medicalConditions,
    workoutDaysPerWeek,
    preferredWorkoutTime,
  } = req.body;

  const userRole = req.user.role;
  const userId = req.user.userId;

  // Determine the actual memberId and trainerId based on user role
  let actualMemberId = memberId;
  let actualTrainerId = userId;

  // If user is a member, they can only generate plans for themselves
  if (userRole === "member") {
    // Members can only generate plans for themselves
    if (memberId && memberId !== userId) {
      throw new ApiError(403, "Members can only generate plans for themselves");
    }
    actualMemberId = userId; // Members generate plans for themselves
    actualTrainerId = userId; // Self-generated, so trainerId is their own ID
  } else if (userRole === "admin" || userRole === "trainer") {
    // Admin/Trainer can generate for any member
    if (!memberId) {
      throw new ApiError(400, "memberId is required for admin/trainer");
    }
    actualTrainerId = userId;
  }

  // Generate AI workout plan
  const aiPlan = await aiService.generateWorkoutPlan({
    age,
    height,
    weight,
    fitnessLevel,
    goal,
    medicalConditions,
    workoutDaysPerWeek,
    preferredWorkoutTime,
  });

  // Save workout plan to database
  const workoutPlan = await WorkoutPlan.create({
    memberId: actualMemberId,
    trainerId: actualTrainerId,
    planName: aiPlan.planName,
    goal: aiPlan.goal,
    duration: aiPlan.duration,
    schedule: aiPlan.schedule,
    aiGenerated: true,
  });

  // Create notification for member (only if not self-generated)
  if (actualMemberId !== userId) {
    await Notification.create({
      userId: actualMemberId,
      type: "plan",
      title: "New Workout Plan Available",
      message: `Your AI-generated workout plan "${aiPlan.planName}" is ready!`,
      priority: "medium",
    });
  }

  const populated = await WorkoutPlan.findById(workoutPlan._id)
    .populate("memberId", "name email")
    .populate("trainerId", "name email");

  res.status(201).json({
    success: true,
    message: "Workout plan generated successfully",
    data: populated,
  });
});

exports.generateDietPlan = asyncHandler(async (req, res) => {
  const {
    memberId,
    age,
    height,
    weight,
    fitnessLevel,
    goal,
    dietaryRestrictions,
    medicalConditions,
  } = req.body;

  const userRole = req.user.role;
  const userId = req.user.userId;

  // Determine the actual memberId and trainerId based on user role
  let actualMemberId = memberId;
  let actualTrainerId = userId;

  // If user is a member, they can only generate plans for themselves
  if (userRole === "member") {
    // Members can only generate plans for themselves
    if (memberId && memberId !== userId) {
      throw new ApiError(403, "Members can only generate plans for themselves");
    }
    actualMemberId = userId; // Members generate plans for themselves
    actualTrainerId = userId; // Self-generated, so trainerId is their own ID
  } else if (userRole === "admin" || userRole === "trainer") {
    // Admin/Trainer can generate for any member
    if (!memberId) {
      throw new ApiError(400, "memberId is required for admin/trainer");
    }
    actualTrainerId = userId;
  }

  // Generate AI diet plan
  const aiPlan = await aiService.generateDietPlan({
    age,
    height,
    weight,
    fitnessLevel,
    goal,
    dietaryRestrictions,
    medicalConditions,
  });

  // Validate and normalize the AI response
  const validatedPlan = {
    planName: String(aiPlan.planName || `Diet Plan for ${goal}`).trim(),
    goal: String(aiPlan.goal || goal).trim(),
    dailyCalories: Number(aiPlan.dailyCalories) || 2000,
    macros: {
      protein: String(aiPlan.macros?.protein || "30%").trim(),
      carbs: String(aiPlan.macros?.carbs || "45%").trim(),
      fats: String(aiPlan.macros?.fats || "25%").trim(),
    },
    meals: [],
  };

  // Ensure dailyCalories meets minimum requirement
  if (validatedPlan.dailyCalories < 1000) {
    validatedPlan.dailyCalories = 2000;
  }

  // Normalize and validate meals
  if (Array.isArray(aiPlan.meals) && aiPlan.meals.length > 0) {
    validatedPlan.meals = aiPlan.meals
      .map(normalizeMealData)
      .filter(meal => meal.items && meal.items.length > 0); // Only include meals with items
  } else {
    // Fallback: create a basic meal structure if AI didn't return meals
    validatedPlan.meals = [
      {
        meal: "Breakfast",
        time: "8:00 AM",
        items: [
          {
            food: "Oatmeal",
            quantity: "1 cup",
            calories: 300,
            protein: "10g",
          },
        ],
        totalCalories: 300,
      },
    ];
  }

  // Save diet plan to database with error handling
  let dietPlan;
  try {
    dietPlan = await DietPlan.create({
      memberId: actualMemberId,
      trainerId: actualTrainerId,
      planName: validatedPlan.planName,
      goal: validatedPlan.goal,
      dailyCalories: validatedPlan.dailyCalories,
      macros: validatedPlan.macros,
      meals: validatedPlan.meals,
      aiGenerated: true,
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      throw new ApiError(400, `Validation error: ${errors.join(", ")}`);
    }
    // Log the error for debugging
    console.error("Error creating diet plan:", error);
    console.error("Validated plan data:", JSON.stringify(validatedPlan, null, 2));
    throw new ApiError(500, "Failed to save diet plan to database");
  }

  // Create notification for member (only if not self-generated)
  if (actualMemberId !== userId) {
    await Notification.create({
      userId: actualMemberId,
      type: "plan",
      title: "New Diet Plan Available",
      message: `Your AI-generated diet plan "${validatedPlan.planName}" is ready!`,
      priority: "medium",
    });
  }

  const populated = await DietPlan.findById(dietPlan._id)
    .populate("memberId", "name email")
    .populate("trainerId", "name email");

  res.status(201).json({
    success: true,
    message: "Diet plan generated successfully",
    data: populated,
  });
});

// Member requests AI plan generation
exports.requestAIPlan = asyncHandler(async (req, res) => {
  const { trainerId, ...planDetails } = req.body;
  const memberId = req.user.userId;

  // Create notification for trainer
  await Notification.create({
    userId: trainerId,
    type: "plan",
    title: "AI Plan Generation Request",
    message: `Member has requested AI-generated workout and diet plans. Please review their details and generate the plans.`,
    priority: "high",
  });

  res.status(200).json({
    success: true,
    message:
      "Your AI plan generation request has been submitted. Your trainer will review and assign your personalized plans soon.",
  });
});

