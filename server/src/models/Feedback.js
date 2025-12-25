const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    category: {
      type: String,
      enum: ["trainer", "facility", "service", "general"],
      default: "general",
    },
  },
  { timestamps: true }
);

// Index for faster queries
feedbackSchema.index({ memberId: 1 });
feedbackSchema.index({ trainerId: 1 });
feedbackSchema.index({ category: 1 });

module.exports = mongoose.model("Feedback", feedbackSchema);

