const Membership = require("../models/Membership");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.getAllMemberships = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};

  const memberships = await Membership.find(query).sort({ cost: 1 });

  res.status(200).json({
    success: true,
    data: memberships,
  });
});

exports.getMembershipById = asyncHandler(async (req, res) => {
  const membership = await Membership.findById(req.params.id);

  if (!membership) {
    throw new ApiError(404, "Membership not found");
  }

  res.status(200).json({
    success: true,
    data: membership,
  });
});

exports.createMembership = asyncHandler(async (req, res) => {
  const membership = await Membership.create(req.body);

  res.status(201).json({
    success: true,
    message: "Membership created successfully",
    data: membership,
  });
});

exports.updateMembership = asyncHandler(async (req, res) => {
  const membership = await Membership.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!membership) {
    throw new ApiError(404, "Membership not found");
  }

  res.status(200).json({
    success: true,
    message: "Membership updated successfully",
    data: membership,
  });
});

exports.deleteMembership = asyncHandler(async (req, res) => {
  const membership = await Membership.findByIdAndDelete(req.params.id);

  if (!membership) {
    throw new ApiError(404, "Membership not found");
  }

  res.status(200).json({
    success: true,
    message: "Membership deleted successfully",
  });
});

exports.toggleMembershipStatus = asyncHandler(async (req, res) => {
  const membership = await Membership.findById(req.params.id);

  if (!membership) {
    throw new ApiError(404, "Membership not found");
  }

  membership.status = membership.status === "active" ? "inactive" : "active";
  await membership.save();

  res.status(200).json({
    success: true,
    message: `Membership ${membership.status} successfully`,
    data: membership,
  });
});

