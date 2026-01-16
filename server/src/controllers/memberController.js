const User = require("../models/User");
const Membership = require("../models/Membership");
const WorkoutPlan = require("../models/WorkoutPlan");
const DietPlan = require("../models/DietPlan");
const Progress = require("../models/Progress");
const Attendance = require("../models/Attendance");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const emailService = require("../services/emailService");
const { calculateMembershipExpiry } = require("../utils/helpers");

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
  const memberData = {
    ...req.body,
    role: "member",
    isActive: true, // Ensure new members are active by default
  };

  // Capture password before it's hashed
  const plainPassword = memberData.password;

  // If membershipId is provided, calculate expiry date
  if (memberData.membershipId) {
    const membership = await Membership.findById(memberData.membershipId);
    if (!membership) {
      throw new ApiError(404, "Membership plan not found");
    }

    // Calculate expiry date based on membership duration
    memberData.membershipExpiry = calculateMembershipExpiry(
      membership.duration,
      membership.durationType,
      new Date()
    );
  }

  // If trainerId is provided, verify trainer exists
  if (memberData.trainerId) {
    const trainer = await User.findById(memberData.trainerId);
    if (!trainer || trainer.role !== "trainer") {
      throw new ApiError(404, "Trainer not found");
    }
  }

  const member = await User.create(memberData);

  // If trainerId was provided, add member to trainer's assignedMembers array
  if (member.trainerId) {
    const trainer = await User.findById(member.trainerId);
    if (trainer && trainer.role === "trainer") {
      // Add member to trainer's assigned members if not already there
      if (!trainer.assignedMembers.includes(member._id)) {
        trainer.assignedMembers.push(member._id);
        await trainer.save();
      }
    }
  }

  // Send account credentials email to the member
  if (plainPassword && member.email) {
    await emailService.sendMemberAccountCredentials(member, plainPassword);
  }

  // Populate membership details for response
  const populatedMember = await User.findById(member._id)
    .select("-password")
    .populate("membershipId", "name cost duration durationType")
    .populate("trainerId", "name email");

  res.status(201).json({
    success: true,
    message: "Member created successfully. Account credentials have been sent to their email.",
    data: populatedMember,
    membershipExpiry: member.membershipExpiry,
    membershipExpiryFormatted: member.membershipExpiry 
      ? member.membershipExpiry.toISOString() 
      : null,
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

  // Get current member to check existing trainerId
  const currentMember = await User.findById(id);
  if (!currentMember || currentMember.role !== "member") {
    throw new ApiError(404, "Member not found");
  }

  const updateData = { ...req.body };

  // Handle password update - ensure it's trimmed
  if (updateData.password) {
    updateData.password = String(updateData.password).trim();
  }

  // If membershipId is being updated, calculate new expiry date
  if (updateData.membershipId) {
    const membership = await Membership.findById(updateData.membershipId);
    if (!membership) {
      throw new ApiError(404, "Membership plan not found");
    }

    // Calculate expiry date based on membership duration
    // Start from current date when updating membership
    updateData.membershipExpiry = calculateMembershipExpiry(
      membership.duration,
      membership.durationType,
      new Date()
    );
  }

  // If trainerId is being updated, handle trainer assignment
  if (updateData.trainerId !== undefined) {
    const oldTrainerId = currentMember.trainerId ? currentMember.trainerId.toString() : null;
    const newTrainerId = updateData.trainerId ? updateData.trainerId.toString() : null;
    
    // If trainerId is changing (either from one to another, or being removed/set)
    if (oldTrainerId !== newTrainerId) {
      // Remove from old trainer's assigned members if existed
      if (oldTrainerId) {
        const oldTrainer = await User.findById(oldTrainerId);
        if (oldTrainer && oldTrainer.role === "trainer") {
          oldTrainer.assignedMembers = oldTrainer.assignedMembers.filter(
            (mId) => mId.toString() !== id.toString()
          );
          await oldTrainer.save();
        }
      }
      
      // Verify new trainer exists if setting one
      if (newTrainerId) {
        const newTrainer = await User.findById(newTrainerId);
        if (!newTrainer || newTrainer.role !== "trainer") {
          throw new ApiError(404, "Trainer not found");
        }
      }
    }
  }

  // If password is being updated, use findById + save to trigger pre-save hook
  // Otherwise use findByIdAndUpdate for better performance
  let member;
  if (updateData.password) {
    // Use findById + save to ensure password is hashed via pre-save hook
    member = await User.findById(id);
    if (!member || member.role !== "member") {
      throw new ApiError(404, "Member not found");
    }
    
    // Update all fields
    Object.keys(updateData).forEach((key) => {
      member[key] = updateData[key];
    });
    
    await member.save();
    
    // Populate after save
    member = await User.findById(member._id)
      .select("-password")
      .populate("membershipId", "name cost duration durationType")
      .populate("trainerId", "name email");
  } else {
    // No password update, use findByIdAndUpdate
    member = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .select("-password")
      .populate("membershipId", "name cost duration durationType")
      .populate("trainerId", "name email");
  }

  if (!member || member.role !== "member") {
    throw new ApiError(404, "Member not found");
  }

  // If trainerId was updated and is set, add member to trainer's assignedMembers array
  if (updateData.trainerId !== undefined && member.trainerId) {
    const trainer = await User.findById(member.trainerId);
    if (trainer && trainer.role === "trainer") {
      // Add member to trainer's assigned members if not already there
      if (!trainer.assignedMembers.some(mId => mId.toString() === member._id.toString())) {
        trainer.assignedMembers.push(member._id);
        await trainer.save();
      }
    }
  }

  res.status(200).json({
    success: true,
    message: "Member updated successfully",
    data: member,
    membershipExpiry: member.membershipExpiry,
    membershipExpiryFormatted: member.membershipExpiry 
      ? member.membershipExpiry.toISOString() 
      : null,
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

