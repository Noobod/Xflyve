const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    pickupLocation: {
      type: String,
      trim: true,
      required: true,
    },
    deliveryLocation: {
      type: String,
      trim: true,
      required: true,
    },
    assignedTo: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Driver",
      required: true,
    },
    assignedTruck: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
      required: true,
    },
    jobDate: {               
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    podUrl: {
      type: String,
    },
    jobType: {
      type: String,
      enum: ["interstate", "local"],
      required: true,
    },
  }, 
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
