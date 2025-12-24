const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sets: {
      type: Number,
      required: true,
      min: 1,
    },
    reps: {
      type: String,
      required: true,
    },
    rest: {
      type: String,
      default: "60s",
    },
  },
  { _id: false }
);

const dayScheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },
    focus: {
      type: String,
      required: true,
    },
    exercises: [exerciseSchema],
  },
  { _id: false }
);

const workoutPlanSchema = new mongoose.Schema(
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
    duration: {
      type: String,
      required: true,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    schedule: [dayScheduleSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
workoutPlanSchema.index({ memberId: 1, isActive: 1 });
workoutPlanSchema.index({ trainerId: 1 });

module.exports = mongoose.model("WorkoutPlan", workoutPlanSchema);

