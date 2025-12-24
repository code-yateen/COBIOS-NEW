const Notification = require("../models/Notification");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { read, page = 1, limit = 20 } = req.query;

  const query = { userId };
  if (read !== undefined) {
    query.read = read === "true";
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    userId,
    read: false,
  });

  res.status(200).json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

exports.getUnreadNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const notifications = await Notification.find({
    userId,
    read: false,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: notifications,
    count: notifications.length,
  });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const notification = await Notification.findOne({ _id: id, userId });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  await Notification.updateMany({ userId, read: false }, { read: true });

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const notification = await Notification.findOneAndDelete({
    _id: id,
    userId,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
});

exports.createNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create(req.body);

  res.status(201).json({
    success: true,
    message: "Notification created successfully",
    data: notification,
  });
});

