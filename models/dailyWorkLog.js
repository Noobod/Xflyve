const mongoose = require("mongoose");

const dailyWorkLogSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    hours: {
      type: Number,
      default: 0,
      min: 0,
    },
    kilometers: {
      type: Number,
      default: 0,
      min: 0,
    },

    // New fields
    localStartTime: {
      type: String, // could be "HH:mm" string, or Date with only time part
      trim: true,
    },
    localEndTime: {
      type: String,
      trim: true,
    },
    interstateStartKm: {
      type: Number,
      min: 0,
    },
    interstateEndKm: {
      type: Number,
      min: 0,
    },
    deliveriesDone: {
      type: Number,
      min: 0,
      default: 0,
    },
    deliveryLocations: [
      {
        type: String,
        trim: true,
      },
    ],

    jobIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DailyWorkLog", dailyWorkLogSchema);
