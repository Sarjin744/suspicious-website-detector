const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    country: {
      type: String,
    },
    risk: {
      score: { type: Number, default: 0 },
      level: { type: String, enum: ["Safe", "Suspicious", "Phishing"], default: "Safe" },
      reasons: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analysis", analysisSchema);
