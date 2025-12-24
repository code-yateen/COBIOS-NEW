const User = require("../models/User");
const WorkoutPlan = require("../models/WorkoutPlan");
const DietPlan = require("../models/DietPlan");
const Progress = require("../models/Progress");
const Attendance = require("../models/Attendance");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.getAllMembers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const members = await User.find({ role: "member" })
    .select("-password")
    .populate("trainerId", "name email")
    .populate("membershipId", "name cost")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments({ role: "member" });

  res.status(200).json({
    success: true,
    data: members,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

exports.getMemberById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Check access: Admin, Trainer, or Self
  if (userRole !== "admin" && userRole !== "trainer" && userId !== id) {
    throw new ApiError(403, "Access denied");
  }

  const member = await User.findById(id)
    .select("-password")
    .populate("trainerId", "name email specialization")
    .populate("membershipId", "name cost duration durationType");

  if (!member || member.role !== "member") {
    throw new ApiError(404, "Member not found");
  }

  res.status(200).json({
    success: true,
    data: member,
  });
});

exports.createMember = asyncHandler(async (req, res) => {
  const member = await User.create({
    ...req.body,
    role: "member",
  });

  res.status(201).json({
    success: true,
    message: "Member created successfully",
    data: member.toJSON(),
  });
});

exports.updateMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Check access: Admin or Self
  if (userRole !== "admin" && userId !== id) {
    throw new ApiError(403, "Access denied");
  }

  const member = await User.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  ).select("-password");

  if (!member || member.role !== "member") {
    throw new ApiError(404, "Member not found");
  }

  res.status(200).json({
    success: true,
    message: "Member updated successfully",
    data: member,
  });
});

exports.deleteMember = asyncHandler(async (req, res) => {
  const member = await User.findByIdAndDelete(req.params.id);

  if (!member || member.role !== "member") {
    throw new ApiError(404, "Member not found");
  }

  res.status(200).json({
    success: true,
    message: "Member deleted successfully",
  });
});

exports.getMemberProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Check access
  if (userRole !== "admin" && userRole !== "trainer" && userId !== id) {
    throw new ApiError(403, "Access denied");
  }

  const progress = await Progress.findOne({ memberId: id });

  res.status(200).json({
    success: true,
    data: progress || { memberId: id, records: [] },
  });
});

exports.getMemberPlans = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Check access
  if (userRole !== "admin" && userRole !== "trainer" && userId !== id) {
    throw new ApiError(403, "Access denied");
  }

  const workoutPlans = await WorkoutPlan.find({ memberId: id });
  const dietPlans = await DietPlan.find({ memberId: id });

  res.status(200).json({
    success: true,
    data: {
      workoutPlans,
      dietPlans,
    },
  });
});

exports.getMemberAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Check access
  if (userRole !== "admin" && userRole !== "trainer" && userId !== id) {
    throw new ApiError(403, "Access denied");
  }

  const attendance = await Attendance.find({ memberId: id })
    .sort({ date: -1 })
    .limit(30);

  res.status(200).json({
    success: true,
    data: attendance,
  });
});

