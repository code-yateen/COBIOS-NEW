const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive, page = 1, limit = 10 } = req.query;

  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === "true";

  const users = await User.find(query)
    .select("-password")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user.toJSON(),
  });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
    data: user.toJSON(),
  });
});

