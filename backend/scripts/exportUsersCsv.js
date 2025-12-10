const mongoose = require("mongoose");
const fs = require("fs");
const Driver = require("../models/driver");
require("dotenv").config();

async function exportCSV() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📌 Connected to MongoDB");

    const drivers = await Driver.find().limit(200);

    if (!drivers.length) {
      console.log("❌ No drivers found!");
      process.exit();
    }

    const csvHeader = "email\n";
    const csvRows = drivers.map(user => user.email).join("\n");
    const csvData = csvHeader + csvRows;

    fs.writeFileSync("users.csv", csvData);

    console.log("🎉 CSV created successfully: users.csv");
    console.log("Total emails:", drivers.length);
    process.exit();
  } catch (err) {
    console.error("❌ Error exporting CSV:", err);
    process.exit(1);
  }
}

exportCSV();
