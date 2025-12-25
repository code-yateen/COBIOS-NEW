const Attendance = require("../models/Attendance");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const calculateDuration = (checkIn, checkOut) => {
  const inTime = new Date(`2000-01-01 ${checkIn}`);
  const outTime = new Date(`2000-01-01 ${checkOut}`);
  const diff = outTime - inTime;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

exports.getAllAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find()
    .populate("memberId", "name email")
    .sort({ date: -1 });

  res.status(200).json({
    success: true,
    data: attendance,
  });
});

exports.getMemberAttendance = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Check access: Admin, Trainer, or Self
  if (userRole !== "admin" && userRole !== "trainer" && memberId !== userId) {
    throw new ApiError(403, "Access denied");
  }

  const attendance = await Attendance.find({ memberId })
    .sort({ date: -1 })
    .limit(30);

  res.status(200).json({
    success: true,
    data: attendance,
  });
});

exports.checkIn = asyncHandler(async (req, res) => {
  const memberId = req.user.userId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already checked in today
  const existing = await Attendance.findOne({
    memberId,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (existing) {
    throw new ApiError(400, "Already checked in today");
  }

  const checkInTime = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const attendance = await Attendance.create({
    memberId,
    date: new Date(),
    checkIn: checkInTime,
  });

  res.status(201).json({
    success: true,
    message: "Checked in successfully",
    data: attendance,
  });
});

exports.checkOut = asyncHandler(async (req, res) => {
  const memberId = req.user.userId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOne({
    memberId,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (!attendance) {
    throw new ApiError(400, "No check-in found for today");
  }

  if (attendance.checkOut) {
    throw new ApiError(400, "Already checked out today");
  }

  const checkOutTime = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  attendance.checkOut = checkOutTime;
  attendance.duration = calculateDuration(attendance.checkIn, checkOutTime);
  await attendance.save();

  res.status(200).json({
    success: true,
    message: "Checked out successfully",
    data: attendance,
  });
});

exports.getTodayAttendance = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await Attendance.find({
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  })
    .populate("memberId", "name email")
    .sort({ checkIn: -1 });

  res.status(200).json({
    success: true,
    data: attendance,
  });
});

exports.getAttendanceStats = asyncHandler(async (req, res) => {
  const totalRecords = await Attendance.countDocuments();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAttendance = await Attendance.countDocuments({
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  const uniqueMembers = await Attendance.distinct("memberId");

  res.status(200).json({
    success: true,
    data: {
      totalRecords,
      todayAttendance,
      uniqueMembers: uniqueMembers.length,
    },
  });
});

