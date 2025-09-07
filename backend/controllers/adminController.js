const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const Driver = require("../models/driver");
const Job = require("../models/job");
const Truck = require("../models/truck");
const DailyWorkLog = require("../models/dailyWorkLog");
const JobPod = require("../models/jobPod");

const exportToExcel = require("../utils/excelExport");
const generateZip = require("../utils/zipGenerator");
const logger = require("../utils/logger");

const ADMIN_ROLE = "admin"; // Use constants for roles

// GET /api/admin/drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().select("-password");
    return res.status(200).json({
      status: "success",
      count: drivers.length,
      data: drivers,
    });
  } catch (err) {
    logger.error("Failed to get all drivers: %o", err);
    return res.status(500).json({ status: "error", message: "Server error fetching drivers" });
  }
};

// GET /api/admin/export-drivers
exports.exportDriversExcel = async (req, res) => {
  try {
    const drivers = await Driver.find().select("-password").lean();

    const headers = [
      { label: "Name", key: "name" },
      { label: "Email", key: "email" },
      { label: "Phone", key: "phone" },
      { label: "Role", key: "role" },
    ];

    const filename = `drivers_${Date.now()}`;
    await exportToExcel(drivers, headers, filename, res);
  } catch (err) {
    logger.error("Failed to export drivers to Excel: %o", err);
    res.status(500).json({ status: "error", message: "Server error exporting drivers" });
  }
};

// DELETE /api/admin/drivers/:driverId
exports.deleteDriver = async (req, res) => {
  try {
    const { driverId } = req.params;

    // Basic driverId format validation (fallback)
    if (!driverId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid driver ID",
      });
    }

    // Prevent admin from deleting own account
    if (req.user.id.toString() === driverId.toString()) {
      return res.status(400).json({
        status: "fail",
        message: "You cannot delete your own admin account",
      });
    }

    const deleted = await Driver.findByIdAndDelete(driverId);
    if (!deleted) {
      return res.status(404).json({ status: "fail", message: "Driver not found" });
    }

    return res.status(200).json({ status: "success", message: "Driver deleted" });
  } catch (err) {
    logger.error("Failed to delete driver %s: %o", req.params.driverId, err);
    return res.status(500).json({ status: "error", message: "Server error deleting driver" });
  }
};

// GET /api/admin/stats
exports.getSystemStats = async (req, res) => {
  try {
    const [jobCount, driverCount, truckCount, logCount] = await Promise.all([
      Job.countDocuments(),
      Driver.countDocuments(),
      Truck.countDocuments(),
      DailyWorkLog.countDocuments(),
    ]);

    return res.status(200).json({
      status: "success",
      data: {
        totalJobs: jobCount,
        totalDrivers: driverCount,
        totalTrucks: truckCount,
        totalLogs: logCount,
      },
    });
  } catch (err) {
    logger.error("Failed to get system stats: %o", err);
    return res.status(500).json({ status: "error", message: "Server error fetching stats" });
  }
};

// GET /api/admin/download-all-pods
exports.downloadAllPods = async (req, res) => {
  try {
    const pods = await JobPod.find().select("filePath");

    const fullPaths = pods
      .map((pod) => path.join(__dirname, "..", pod.filePath))
      .filter((filePath) => {
        if (!fs.existsSync(filePath)) {
          logger.warn(`Missing POD file skipped in ZIP: ${filePath}`);
          return false;
        }
        return true;
      });

    if (fullPaths.length === 0) {
      return res.status(404).json({ status: "fail", message: "No POD files found" });
    }

    logger.info(`Zipping ${fullPaths.length} POD files`);
    generateZip(fullPaths, "all_pods.zip", res);
  } catch (err) {
    logger.error("Failed to download all PODs: %o", err);
    res.status(500).json({ status: "error", message: "Server error generating PODs ZIP" });
  }
};

exports.createDriver = async (req, res) => {
  try {
    const { name, email, password, driverType } = req.body;

    // Check if email already exists
    const existingDriver = await Driver.findOne({ email });
    if (existingDriver) {
      return res.status(400).json({ status: "fail", message: "Email already in use" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    const newDriver = new Driver({
      name,
      email,
      password: hashedPassword,
      driverType,
      role: "driver", // force role to driver
    });

    await newDriver.save();

    return res.status(201).json({ status: "success", message: "Driver created successfully" });
  } catch (err) {
    logger.error("Failed to create driver: %o", err);
    return res.status(500).json({ status: "error", message: "Server error creating driver" });
  }
};
