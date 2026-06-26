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
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
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

jobSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const now = new Date();

    if (this.status === "in-progress" && !this.startedAt) {
      this.startedAt = now;
    }

    if (this.status === "completed" && !this.completedAt) {
      this.completedAt = now;
    }
  }

  next();
});

module.exports = mongoose.model("Job", jobSchema);
