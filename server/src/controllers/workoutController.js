const WorkoutPlan = require("../models/WorkoutPlan");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.getAllWorkoutPlans = asyncHandler(async (req, res) => {
  const workoutPlans = await WorkoutPlan.find()
    .populate("memberId", "name email")
    .populate("trainerId", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: workoutPlans,
  });
});

exports.getWorkoutPlanById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  const plan = await WorkoutPlan.findById(id)
    .populate("memberId", "name email")
    .populate("trainerId", "name email");

  if (!plan) {
    throw new ApiError(404, "Workout plan not found");
  }

  // Check access: Admin, Trainer, or Member (own plan)
  if (
    userRole !== "admin" &&
    userRole !== "trainer" &&
    plan.memberId._id.toString() !== userId
  ) {
    throw new ApiError(403, "Access denied");
  }

  res.status(200).json({
    success: true,
    data: plan,
  });
});

exports.createWorkoutPlan = asyncHandler(async (req, res) => {
  const workoutPlan = await WorkoutPlan.create({
    ...req.body,
    trainerId: req.user.userId,
  });

  const populated = await WorkoutPlan.findById(workoutPlan._id)
    .populate("memberId", "name email")
    .populate("trainerId", "name email");

  res.status(201).json({
    success: true,
    message: "Workout plan created successfully",
    data: populated,
  });
});

exports.updateWorkoutPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  const plan = await WorkoutPlan.findById(id);

  if (!plan) {
    throw new ApiError(404, "Workout plan not found");
  }

  // Check access: Admin or Trainer (own plan)
  if (userRole !== "admin" && plan.trainerId.toString() !== userId) {
    throw new ApiError(403, "Access denied");
  }

  const updated = await WorkoutPlan.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("memberId", "name email")
    .populate("trainerId", "name email");

  res.status(200).json({
    success: true,
    message: "Workout plan updated successfully",
    data: updated,
  });
});

exports.deleteWorkoutPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  const plan = await WorkoutPlan.findById(id);

  if (!plan) {
    throw new ApiError(404, "Workout plan not found");
  }

  // Check access: Admin or Trainer (own plan)
  if (userRole !== "admin" && plan.trainerId.toString() !== userId) {
    throw new ApiError(403, "Access denied");
  }

  await WorkoutPlan.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Workout plan deleted successfully",
  });
});

exports.getMemberWorkoutPlans = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Check access: Admin, Trainer, or Self
  if (userRole !== "admin" && userRole !== "trainer" && memberId !== userId) {
    throw new ApiError(403, "Access denied");
  }

  const plans = await WorkoutPlan.find({ memberId })
    .populate("trainerId", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: plans,
  });
});

