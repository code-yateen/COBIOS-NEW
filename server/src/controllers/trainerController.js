const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.getAllTrainers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const trainers = await User.find({ role: "trainer", isActive: true })
    .select("-password")
    .populate("assignedMembers", "name email")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments({ role: "trainer", isActive: true });

  res.status(200).json({
    success: true,
    data: trainers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

exports.getTrainerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Check access: Admin, the trainer, or a member assigned to the trainer
  let allowed = false;
  if (userRole === "admin" || userId === id) {
    allowed = true;
  } else if (userRole === "member") {
    const member = await User.findById(userId);
    if (member && member.trainerId && member.trainerId.toString() === id.toString()) {
      allowed = true;
    }
  }
  if (!allowed) {
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
  const trainerData = {
    ...req.body,
    role: "trainer",
    isActive: req.body.isActive !== undefined ? req.body.isActive : true, // Ensure active by default
  };

  // Capture password before it's hashed
  const plainPassword = trainerData.password;

  const trainer = await User.create(trainerData);

  // Send account credentials email
  if (plainPassword && trainer.email) {
    await emailService.sendTrainerAccountCredentials(trainer, plainPassword);
  }

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

