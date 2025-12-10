const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
require("dotenv").config();

const Driver = require("../models/driver");

const MONGO_URL = process.env.MONGO_URI;

async function seedDrivers() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("📌 Connected to MongoDB");

    const fakeDrivers = [];

    for (let i = 0; i < 100; i++) {
      fakeDrivers.push({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: "password123", // 🔥 Plain password for presentation
        role: "driver",
        driverType: faker.helpers.arrayElement(["local", "interstate"]),
      });
    }

    await Driver.insertMany(fakeDrivers);

    console.log("🎉 500 Fake Drivers Added Successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeder Error:", err);
    process.exit(1);
  }
}

seedDrivers();
