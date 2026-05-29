const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    website: {
      type: String,
      required: [true, "Website domain is required"],
      trim: true
    },
    category: {
      type: String,
      enum: ["productive", "unproductive", "neutral"],
      default: "neutral"
    },
    duration: {
      type: Number,
      required: [true, "Duration in seconds is required"],
      min: [0, "Duration cannot be negative"]
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Optimize search queries on user + date
ActivitySchema.index({ user: 1, date: -1 });

module.exports = mongoose.model("Activity", ActivitySchema);
