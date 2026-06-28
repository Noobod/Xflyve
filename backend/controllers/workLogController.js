const mongoose = require("mongoose");
const DailyWorkLog = require("../models/dailyWorkLog");
const logger = require("../utils/logger");

const normalizeDateOnly = (value) => {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Date(`${date.toISOString().slice(0, 10)}T00:00:00.000Z`);
};

/**
 * Create a new daily work log.
 * Uses driverId from JWT token (req.user.id)
 * Driver-created records are independent daily work and are not job-linked.
 */
exports.createWorkLog = async (req, res) => {
  const { date, workDate, hours, kilometers, notes, localStartTime, localEndTime, interstateStartKm, interstateEndKm, deliveriesDone, deliveryLocations } = req.body;
  const driverId = req.user.id || req.user._id; // use driverId from token
  const effectiveDate = workDate || date;

  if (!driverId || !effectiveDate || !mongoose.Types.ObjectId.isValid(driverId)) {
    return res.status(400).json({
      success: false,
      message: "Valid driverId (from token) and work date are required",
    });
  }

  try {
    const normalizedWorkDate = normalizeDateOnly(effectiveDate);
    if (!normalizedWorkDate) {
      return res.status(400).json({ success: false, message: "Invalid work date" });
    }

    const newLog = new DailyWorkLog({
      driverId,
      date: normalizedWorkDate,
      workDate: normalizedWorkDate,
      hours,
      kilometers,
      notes,
      localStartTime,
      localEndTime,
      interstateStartKm,
      interstateEndKm,
      deliveriesDone,
      deliveryLocations,
      jobIds: [],
    });

    await newLog.save();

    return res.status(201).json({
      success: true,
      message: "Work log created",
      data: newLog,
    });
  } catch (err) {
    logger.error("Create WorkLog error: %o", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.statusCode ? err.message : "Server error",
    });
  }
};

/**
 * Get all daily work logs for a specific driver.
 * Only allows driver to get their own logs.
 */
exports.getLogsByDriver = async (req, res) => {
  const { driverId } = req.params;
  const userId = req.user.id || req.user._id;

  if (!mongoose.Types.ObjectId.isValid(driverId)) {
    return res.status(400).json({ success: false, message: "Invalid driverId" });
  }

  if (String(driverId) !== String(userId)) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  try {
    const logs = await DailyWorkLog.find({ driverId });
    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (err) {
    logger.error("Get Logs By Driver error: %o", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Get logs for the current logged-in driver (no param needed)
 */
exports.getMyLogs = async (req, res) => {
  const driverId = req.user.id || req.user._id;

  if (!mongoose.Types.ObjectId.isValid(driverId)) {
    return res.status(400).json({ success: false, message: "Invalid driverId" });
  }

  try {
    const logs = await DailyWorkLog.find({ driverId });
    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (err) {
    logger.error("Get My Logs error: %o", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Update a work log by its ID.
 * Only allows updating specified fields.
 */
exports.updateWorkLog = async (req, res) => {
  const { logId } = req.params;
  const userId = req.user.id || req.user._id;
  const userRole = req.user.role;

  if (!mongoose.Types.ObjectId.isValid(logId)) {
    return res.status(400).json({ success: false, message: "Invalid logId" });
  }

  const allowedUpdates = [
    "date",
    "workDate",
    "hours",
    "kilometers",
    "notes",
    "localStartTime",
    "localEndTime",
    "interstateStartKm",
    "interstateEndKm",
    "deliveriesDone",
    "deliveryLocations",
  ];
  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (updates.deliveryLocations && !Array.isArray(updates.deliveryLocations)) {
    updates.deliveryLocations = [];
  }

  try {
    const log = await DailyWorkLog.findById(logId);
    if (!log) {
      return res.status(404).json({ success: false, message: "Work log not found" });
    }

    if (userRole !== "admin" && String(log.driverId) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (userRole === "driver" && log.status === "approved") {
      return res.status(409).json({
        success: false,
        message: "Approved records are locked and cannot be edited",
      });
    }

    if (updates.date || updates.workDate) {
      const normalizedWorkDate = normalizeDateOnly(updates.workDate || updates.date);
      if (!normalizedWorkDate) {
        return res.status(400).json({ success: false, message: "Invalid work date" });
      }
      updates.date = normalizedWorkDate;
      updates.workDate = normalizedWorkDate;
    }

    Object.assign(log, updates);

    if (userRole === "driver" && log.status === "rejected") {
      log.status = "pending";
      log.rejectedBy = null;
      log.rejectedAt = null;
      log.rejectionReason = undefined;
    }

    await log.save();

    return res.status(200).json({
      success: true,
      message: "Work log updated",
      data: log,
    });
  } catch (err) {
    logger.error("Update WorkLog error: %o", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.statusCode ? err.message : "Server error",
    });
  }
};

/**
 * Delete a work log by its ID.
 */
exports.deleteWorkLog = async (req, res) => {
  const { logId } = req.params;
  const userId = req.user.id || req.user._id;
  const userRole = req.user.role;

  if (!mongoose.Types.ObjectId.isValid(logId)) {
    return res.status(400).json({ success: false, message: "Invalid logId" });
  }

  try {
    const log = await DailyWorkLog.findById(logId);
    if (!log) {
      return res.status(404).json({ success: false, message: "Work log not found" });
    }

    if (userRole !== "admin" && String(log.driverId) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (userRole === "driver" && log.status === "approved") {
      return res.status(409).json({
        success: false,
        message: "Approved records are locked and cannot be deleted",
      });
    }

    await log.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Work log deleted",
    });
  } catch (err) {
    logger.error("Delete WorkLog error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.approveWorkLog = async (req, res) => {
  const { logId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(logId)) {
    return res.status(400).json({ success: false, message: "Invalid logId" });
  }

  try {
    const log = await DailyWorkLog.findById(logId);
    if (!log) return res.status(404).json({ success: false, message: "Work log not found" });

    log.status = "approved";
    log.approvedBy = req.user.id;
    log.approvedAt = new Date();
    log.rejectedBy = null;
    log.rejectedAt = null;
    log.rejectionReason = undefined;

    await log.save();

    return res.status(200).json({ success: true, message: "Daily record approved", data: log });
  } catch (err) {
    logger.error("Approve WorkLog error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.rejectWorkLog = async (req, res) => {
  const { logId } = req.params;
  const { rejectionReason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(logId)) {
    return res.status(400).json({ success: false, message: "Invalid logId" });
  }

  try {
    const log = await DailyWorkLog.findById(logId);
    if (!log) return res.status(404).json({ success: false, message: "Work log not found" });

    log.status = "rejected";
    log.rejectedBy = req.user.id;
    log.rejectedAt = new Date();
    log.rejectionReason = rejectionReason;
    log.approvedBy = null;
    log.approvedAt = null;

    await log.save();

    return res.status(200).json({ success: true, message: "Daily record rejected", data: log });
  } catch (err) {
    logger.error("Reject WorkLog error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------- NEW: Admin Get All Work Logs or by Driver -------------
/**
 * @desc Get all daily work logs or filter by driverId (Admin only)
 * @route GET /api/worklogs/admin/:driverId?
 * @access Admin only
 */
exports.getAllLogsForAdmin = async (req, res) => {
  const { driverId } = req.params;

  try {
    let query = {};
    if (driverId) {
      if (!mongoose.Types.ObjectId.isValid(driverId)) {
        return res.status(400).json({ success: false, message: "Invalid driverId" });
      }
      query.driverId = driverId;
    }

    // Populate driver details and job details for admin view
    const logs = await DailyWorkLog.find(query)
      .populate("driverId", "name email")  // adjust fields as per your driver model
      .populate("jobIds", "title pickupLocation deliveryLocation jobDate status")
      .sort({ workDate: -1, date: -1 });

    return res.status(200).json({ success: true, data: logs });
  } catch (err) {
    logger.error("Admin get all logs error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getPendingLogsForAdmin = async (req, res) => {
  try {
    const logs = await DailyWorkLog.find({ status: "pending" })
      .populate("driverId", "name email")
      .populate("jobIds", "title pickupLocation deliveryLocation jobDate status")
      .sort({ workDate: -1, date: -1 });

    return res.status(200).json({ success: true, data: logs });
  } catch (err) {
    logger.error("Admin get pending logs error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
