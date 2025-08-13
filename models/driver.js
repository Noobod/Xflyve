const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Remove extra spaces
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"], // Basic email regex
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["driver", "admin"],
      default: "driver", // Default to 'driver' role
    },
    driverType: {
      type: String,
      enum: ["local", "interstate"],
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Pre-save hook to ensure email is always lowercase
driverSchema.pre("save", function (next) {
  if (this.isModified("email")) {
    this.email = this.email.toLowerCase();
  }
  next();
});

module.exports = mongoose.model("Driver", driverSchema);
