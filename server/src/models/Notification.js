const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "membership",
        "payment",
        "plan",
        "feedback",
        "achievement",
        "admin",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    read: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
  },
  { timestamps: true }
);

// Index for faster queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);

