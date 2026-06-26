const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$.{53}$/;

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

// Pre-save hook to normalize email and protect password hashing centrally.
driverSchema.pre("save", async function (next) {
  if (this.isModified("email")) {
    this.email = this.email.toLowerCase();
  }

  if (this.isModified("password") && !BCRYPT_HASH_REGEX.test(this.password)) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  next();
});

module.exports = mongoose.model("Driver", driverSchema);
