const mongoose = require("mongoose");

const permanentTruckAssignmentSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
      unique: true, // A driver can only be assigned one truck permanently
    },
    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver", // assuming admin is also from Driver model
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PermanentTruckAssignment", permanentTruckAssignmentSchema);
