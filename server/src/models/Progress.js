const mongoose = require("mongoose");

const progressRecordSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    weight: {
      type: Number,
      required: true,
      min: [20, "Weight must be at least 20 kg"],
    },
    bmi: {
      type: Number,
      min: 0,
    },
    bodyFat: {
      type: Number,
      min: 0,
      max: 100,
    },
    muscleMass: {
      type: Number,
      min: 0,
    },
  },
  { _id: true }
);

const progressSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    records: [progressRecordSchema],
  },
  { timestamps: true }
);

// Index for faster queries
progressSchema.index({ memberId: 1 });

module.exports = mongoose.model("Progress", progressSchema);

