const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.getAllTrainers = asyncHandler(async (req, res) => {
  const trainers = await User.find({ role: "trainer", isActive: true })
    .select("-password")
    .populate("assignedMembers", "name email");

  res.status(200).json({
    success: true,
    data: trainers,
  });
});

exports.getTrainerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Check access: Admin or Self
  if (userRole !== "admin" && userId !== id) {
    throw new ApiError(403, "Access denied");
  }

  const trainer = await User.findById(id)
    .select("-password")
    .populate("assignedMembers", "name email phone");

  if (!trainer || trainer.role !== "trainer") {
    throw new ApiError(404, "Trainer not found");
  }

  res.status(200).json({
    success: true,
    data: trainer,
  });
});

exports.createTrainer = asyncHandler(async (req, res) => {
  const trainer = await User.create({
    ...req.body,
    role: "trainer",
  });

  res.status(201).json({
    success: true,
    message: "Trainer created successfully",
    data: trainer.toJSON(),
  });
});

exports.updateTrainer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Check access: Admin or Self
  if (userRole !== "admin" && userId !== id) {
    throw new ApiError(403, "Access denied");
  }

  const trainer = await User.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  ).select("-password");

  if (!trainer || trainer.role !== "trainer") {
    throw new ApiError(404, "Trainer not found");
  }

  res.status(200).json({
    success: true,
    message: "Trainer updated successfully",
    data: trainer,
  });
});

exports.deleteTrainer = asyncHandler(async (req, res) => {
  const trainer = await User.findByIdAndDelete(req.params.id);

  if (!trainer || trainer.role !== "trainer") {
    throw new ApiError(404, "Trainer not found");
  }

  res.status(200).json({
    success: true,
    message: "Trainer deleted successfully",
  });
});

exports.getTrainerMembers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Check access: Admin or Self
  if (userRole !== "admin" && userId !== id) {
    throw new ApiError(403, "Access denied");
  }

  const members = await User.find({ trainerId: id, role: "member" })
    .select("-password")
    .populate("membershipId", "name cost");

  res.status(200).json({
    success: true,
    data: members,
  });
});

exports.assignMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { memberId } = req.body;

  const trainer = await User.findById(id);
  if (!trainer || trainer.role !== "trainer") {
    throw new ApiError(404, "Trainer not found");
  }

  const member = await User.findById(memberId);
  if (!member || member.role !== "member") {
    throw new ApiError(404, "Member not found");
  }

  // Add member to trainer's assigned members
  if (!trainer.assignedMembers.includes(memberId)) {
    trainer.assignedMembers.push(memberId);
    await trainer.save();
  }

  // Assign trainer to member
  member.trainerId = id;
  await member.save();

  res.status(200).json({
    success: true,
    message: "Member assigned to trainer successfully",
  });
});

exports.unassignMember = asyncHandler(async (req, res) => {
  const { id, memberId } = req.params;

  const trainer = await User.findById(id);
  if (!trainer || trainer.role !== "trainer") {
    throw new ApiError(404, "Trainer not found");
  }

  const member = await User.findById(memberId);
  if (!member || member.role !== "member") {
    throw new ApiError(404, "Member not found");
  }

  // Remove member from trainer's assigned members
  trainer.assignedMembers = trainer.assignedMembers.filter(
    (m) => m.toString() !== memberId
  );
  await trainer.save();

  // Remove trainer from member
  member.trainerId = undefined;
  await member.save();

  res.status(200).json({
    success: true,
    message: "Member unassigned from trainer successfully",
  });
});

