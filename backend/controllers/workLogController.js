const mongoose = require("mongoose");
const DailyWorkLog = require("../models/dailyWorkLog");
const Job = require("../models/job");
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

const getOwnedJobIds = async (jobIds = [], driverId) => {
  if (!Array.isArray(jobIds) || jobIds.length === 0) return [];

  const uniqueJobIds = [...new Set(jobIds.map((id) => id.toString()))];
  const invalidJobId = uniqueJobIds.find((id) => !mongoose.Types.ObjectId.isValid(id));
  if (invalidJobId) {
    const error = new Error("Invalid jobId in jobIds");
    error.statusCode = 400;
    throw error;
  }

  const jobs = await Job.find({
    _id: { $in: uniqueJobIds },
    assignedTo: driverId,
  }).select("_id").lean();

  if (jobs.length !== uniqueJobIds.length) {
    const error = new Error("One or more jobs are not assigned to this driver");
    error.statusCode = 403;
    throw error;
  }

  return uniqueJobIds;
};

/**
 * Create a new daily work log.
 * Uses driverId from JWT token (req.user.id)
 * jobIds is optional and must belong to the authenticated driver.
 */
exports.createWorkLog = async (req, res) => {
  const { date, workDate, hours, kilometers, notes, localStartTime, localEndTime, interstateStartKm, interstateEndKm, deliveriesDone, deliveryLocations, jobIds } = req.body;
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

    const ownedJobIds = await getOwnedJobIds(jobIds, driverId);

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
      jobIds: ownedJobIds,
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
    "jobIds",
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

    if (updates.date || updates.workDate) {
      const normalizedWorkDate = normalizeDateOnly(updates.workDate || updates.date);
      if (!normalizedWorkDate) {
        return res.status(400).json({ success: false, message: "Invalid work date" });
      }
      updates.date = normalizedWorkDate;
      updates.workDate = normalizedWorkDate;
    }

    if (updates.jobIds !== undefined) {
      updates.jobIds = await getOwnedJobIds(updates.jobIds, log.driverId);
    }

    Object.assign(log, updates);
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
