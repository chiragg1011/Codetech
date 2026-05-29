const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    totalTimeSpent: {
      type: Number,
      required: true,
      default: 0
    },
    productiveTime: {
      type: Number,
      required: true,
      default: 0
    },
    unproductiveTime: {
      type: Number,
      required: true,
      default: 0
    },
    productivityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0
    },
    statistics: {
      mostProductiveDay: String,
      leastProductiveDay: String,
      distractionsCount: {
        type: Number,
        default: 0
      }
    },
    aiSuggestions: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

ReportSchema.index({ user: 1, startDate: -1 });

module.exports = mongoose.model("Report", ReportSchema);
