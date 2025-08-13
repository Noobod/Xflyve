const mongoose = require("mongoose");

const jobPodSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  podFilePath: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true }); // Add timestamps for audit if needed

module.exports = mongoose.model("JobPod", jobPodSchema);
