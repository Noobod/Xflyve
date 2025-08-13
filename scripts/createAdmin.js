const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Driver = require("../models/driver");
require("dotenv").config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const existingAdmin = await Driver.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      console.log("Admin user already exists. Exiting.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const adminUser = new Driver({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      driverType: "local", // or leave blank, admin can have any or none
    });

    await adminUser.save();
    console.log("Admin user created successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin user:", err);
    process.exit(1);
  }
}

createAdmin();
