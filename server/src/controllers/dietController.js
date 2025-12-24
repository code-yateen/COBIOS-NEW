const DietPlan = require("../models/DietPlan");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.getAllDietPlans = asyncHandler(async (req, res) => {
  const dietPlans = await DietPlan.find()
    .populate("memberId", "name email")
    .populate("trainerId", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: dietPlans,
  });
});

exports.getDietPlanById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  const plan = await DietPlan.findById(id)
    .populate("memberId", "name email")
    .populate("trainerId", "name email");

  if (!plan) {
    throw new ApiError(404, "Diet plan not found");
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

exports.createDietPlan = asyncHandler(async (req, res) => {
  const dietPlan = await DietPlan.create({
    ...req.body,
    trainerId: req.user.userId,
  });

  const populated = await DietPlan.findById(dietPlan._id)
    .populate("memberId", "name email")
    .populate("trainerId", "name email");

  res.status(201).json({
    success: true,
    message: "Diet plan created successfully",
    data: populated,
  });
});

exports.updateDietPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  const plan = await DietPlan.findById(id);

  if (!plan) {
    throw new ApiError(404, "Diet plan not found");
  }

  // Check access: Admin or Trainer (own plan)
  if (userRole !== "admin" && plan.trainerId.toString() !== userId) {
    throw new ApiError(403, "Access denied");
  }

  const updated = await DietPlan.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("memberId", "name email")
    .populate("trainerId", "name email");

  res.status(200).json({
    success: true,
    message: "Diet plan updated successfully",
    data: updated,
  });
});

exports.deleteDietPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  const plan = await DietPlan.findById(id);

  if (!plan) {
    throw new ApiError(404, "Diet plan not found");
  }

  // Check access: Admin or Trainer (own plan)
  if (userRole !== "admin" && plan.trainerId.toString() !== userId) {
    throw new ApiError(403, "Access denied");
  }

  await DietPlan.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Diet plan deleted successfully",
  });
});

exports.getMemberDietPlans = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Check access: Admin, Trainer, or Self
  if (userRole !== "admin" && userRole !== "trainer" && memberId !== userId) {
    throw new ApiError(403, "Access denied");
  }

  const plans = await DietPlan.find({ memberId })
    .populate("trainerId", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: plans,
  });
});

