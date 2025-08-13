const mongoose = require("mongoose");

const truckSchema = new mongoose.Schema({
  truckNumber: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true,
  },
  capacity: { 
    type: Number, 
    required: true 
  }, // e.g. tons or cubic meters
  status: { 
    type: String, 
    enum: ["available", "on route", "maintenance"], 
    default: "available" 
  },
  assignedDriver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Driver" 
  },
  lastMaintenanceDate: { type: Date },
}, { timestamps: true });

// Normalize truckNumber before saving
truckSchema.pre("save", function(next) {
  if (this.isModified("truckNumber")) {
    this.truckNumber = this.truckNumber.toUpperCase();
  }
  next();
});

module.exports = mongoose.model("Truck", truckSchema);
