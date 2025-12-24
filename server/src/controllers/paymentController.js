const Payment = require("../models/Payment");
const paymentService = require("../services/paymentService");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.getAllPayments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = status ? { status } : {};

  const payments = await Payment.find(query)
    .populate("memberId", "name email")
    .populate("membershipId", "name cost")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ paymentDate: -1 });

  const total = await Payment.countDocuments(query);

  res.status(200).json({
    success: true,
    data: payments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

exports.getPaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  const payment = await Payment.findById(id)
    .populate("memberId", "name email")
    .populate("membershipId", "name cost");

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  // Check access: Admin or Self
  if (userRole !== "admin" && payment.memberId._id.toString() !== userId) {
    throw new ApiError(403, "Access denied");
  }

  res.status(200).json({
    success: true,
    data: payment,
  });
});

exports.createPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.processPayment(req.body);

  res.status(201).json({
    success: true,
    message: "Payment created successfully",
    data: payment,
  });
});

exports.updatePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
    .populate("memberId", "name email")
    .populate("membershipId", "name cost");

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  res.status(200).json({
    success: true,
    message: "Payment updated successfully",
    data: payment,
  });
});

exports.deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  res.status(200).json({
    success: true,
    message: "Payment deleted successfully",
  });
});

exports.getMemberPayments = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Check access: Admin or Self
  if (userRole !== "admin" && memberId !== userId) {
    throw new ApiError(403, "Access denied");
  }

  const payments = await Payment.find({ memberId })
    .populate("membershipId", "name cost")
    .sort({ paymentDate: -1 });

  res.status(200).json({
    success: true,
    data: payments,
  });
});

exports.getPaymentStats = asyncHandler(async (req, res) => {
  const stats = await paymentService.getPaymentStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
});

exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const payment = await Payment.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  res.status(200).json({
    success: true,
    message: "Payment status updated successfully",
    data: payment,
  });
});

