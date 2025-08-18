const mongoose = require("mongoose");

const dailyTruckAssignmentSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    truckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate truck-driver-date entries
dailyTruckAssignmentSchema.index(
  { driverId: 1, truckId: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model("DailyTruckAssignment", dailyTruckAssignmentSchema);
