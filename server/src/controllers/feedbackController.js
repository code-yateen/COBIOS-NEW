const Feedback = require("../models/Feedback");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.getAllFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find()
    .populate("memberId", "name email")
    .populate("trainerId", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: feedback,
  });
});

exports.getFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id)
    .populate("memberId", "name email")
    .populate("trainerId", "name email");

  if (!feedback) {
    throw new ApiError(404, "Feedback not found");
  }

  res.status(200).json({
    success: true,
    data: feedback,
  });
});

exports.createFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.create({
    ...req.body,
    memberId: req.user.userId,
  });

  const populated = await Feedback.findById(feedback._id)
    .populate("memberId", "name email")
    .populate("trainerId", "name email");

  res.status(201).json({
    success: true,
    message: "Feedback submitted successfully",
    data: populated,
  });
});

exports.deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);

  if (!feedback) {
    throw new ApiError(404, "Feedback not found");
  }

  res.status(200).json({
    success: true,
    message: "Feedback deleted successfully",
  });
});

exports.getTrainerFeedback = asyncHandler(async (req, res) => {
  const { trainerId } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Check access: Admin or Trainer (own feedback)
  if (userRole !== "admin" && trainerId !== userId) {
    throw new ApiError(403, "Access denied");
  }

  const feedback = await Feedback.find({ trainerId })
    .populate("memberId", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: feedback,
  });
});

exports.getMemberFeedback = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Check access: Admin or Self
  if (userRole !== "admin" && memberId !== userId) {
    throw new ApiError(403, "Access denied");
  }

  const feedback = await Feedback.find({ memberId })
    .populate("trainerId", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: feedback,
  });
});

exports.getFeedbackStats = asyncHandler(async (req, res) => {
  const total = await Feedback.countDocuments();
  const avgRating = await Feedback.aggregate([
    { $group: { _id: null, avg: { $avg: "$rating" } } },
  ]);

  const byCategory = await Feedback.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      averageRating: avgRating[0]?.avg || 0,
      byCategory,
    },
  });
});

