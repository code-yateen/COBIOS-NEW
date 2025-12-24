const Progress = require("../models/Progress");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.getAllProgress = asyncHandler(async (req, res) => {
  const progress = await Progress.find()
    .populate("memberId", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: progress,
  });
});

exports.getMemberProgress = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Check access: Admin, Trainer, or Self
  if (userRole !== "admin" && userRole !== "trainer" && memberId !== userId) {
    throw new ApiError(403, "Access denied");
  }

  let progress = await Progress.findOne({ memberId });

  if (!progress) {
    progress = { memberId, records: [] };
  }

  res.status(200).json({
    success: true,
    data: progress,
  });
});

exports.addProgressRecord = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Check access: Admin, Trainer, or Self
  if (userRole !== "admin" && userRole !== "trainer" && memberId !== userId) {
    throw new ApiError(403, "Access denied");
  }

  let progress = await Progress.findOne({ memberId });

  if (!progress) {
    progress = await Progress.create({ memberId, records: [] });
  }

  // Calculate BMI if height is available (would need to get from user profile)
  const record = {
    ...req.body,
    date: new Date(),
  };

  progress.records.push(record);
  await progress.save();

  res.status(201).json({
    success: true,
    message: "Progress record added successfully",
    data: progress,
  });
});

exports.updateProgressRecord = asyncHandler(async (req, res) => {
  const { memberId, recordId } = req.params;
  const userRole = req.user.role;

  // Only Admin and Trainer can update
  if (userRole !== "admin" && userRole !== "trainer") {
    throw new ApiError(403, "Access denied");
  }

  const progress = await Progress.findOne({ memberId });

  if (!progress) {
    throw new ApiError(404, "Progress not found");
  }

  const record = progress.records.id(recordId);
  if (!record) {
    throw new ApiError(404, "Progress record not found");
  }

  Object.assign(record, req.body);
  await progress.save();

  res.status(200).json({
    success: true,
    message: "Progress record updated successfully",
    data: progress,
  });
});

exports.deleteProgressRecord = asyncHandler(async (req, res) => {
  const { memberId, recordId } = req.params;

  const progress = await Progress.findOne({ memberId });

  if (!progress) {
    throw new ApiError(404, "Progress not found");
  }

  const record = progress.records.id(recordId);
  if (!record) {
    throw new ApiError(404, "Progress record not found");
  }

  record.remove();
  await progress.save();

  res.status(200).json({
    success: true,
    message: "Progress record deleted successfully",
    data: progress,
  });
});

