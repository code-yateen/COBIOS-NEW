const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema(
  {
    food: {
      type: String,
      required: true,
    },
    quantity: {
      type: String,
      required: true,
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    protein: {
      type: String,
    },
  },
  { _id: false }
);

const mealSchema = new mongoose.Schema(
  {
    meal: {
      type: String,
      enum: [
        "Breakfast",
        "Mid-Morning Snack",
        "Lunch",
        "Afternoon Snack",
        "Dinner",
        "Post-Workout",
      ],
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    items: [foodItemSchema],
    totalCalories: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const dietPlanSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planName: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
    },
    goal: {
      type: String,
      required: [true, "Goal is required"],
    },
    dailyCalories: {
      type: Number,
      required: true,
      min: [1000, "Daily calories should be at least 1000"],
    },
    macros: {
      protein: { type: String, default: "30%" },
      carbs: { type: String, default: "45%" },
      fats: { type: String, default: "25%" },
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    meals: [mealSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
dietPlanSchema.index({ memberId: 1, isActive: 1 });
dietPlanSchema.index({ trainerId: 1 });

module.exports = mongoose.model("DietPlan", dietPlanSchema);

