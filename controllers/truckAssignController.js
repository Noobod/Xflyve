const mongoose = require("mongoose");
const TruckAssignment = require("../models/dailyTruckAssignment");
const logger = require("../utils/logger");

/**
 * @desc Assign a truck to a driver on a specific date
 * @route POST /api/truck-assignments
 * @access Admin only
 */
exports.assignTruck = async (req, res) => {
  const { truckId, driverId, date } = req.body;

  if (!mongoose.Types.ObjectId.isValid(truckId) || !mongoose.Types.ObjectId.isValid(driverId) || !date) {
    return res.status(400).json({ success: false, message: "Invalid input data" });
  }

  try {
    // Prevent duplicate assignment for the same truck, driver, and date
    const existing = await TruckAssignment.findOne({ truckId, driverId, date }).lean();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This truck is already assigned to this driver for the given date",
      });
    }

    const assignment = new TruckAssignment({ truckId, driverId, date });
    await assignment.save();

    return res.status(201).json({
      success: true,
      message: "Truck assigned successfully",
      data: assignment,
    });
  } catch (err) {
    logger.error("Assign truck error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Get all daily truck assignments (Admin only)
 * @route GET /api/truck-assignments
 */
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await TruckAssignment.find()
      .populate("truckId")
      .populate("driverId")
      .lean();

    return res.status(200).json({
      success: true,
      message: "All assignments fetched successfully",
      data: assignments,
    });
  } catch (err) {
    logger.error("Get assignments error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Get a driver's truck assignment for a specific date
 * @route GET /api/truck-assignments/:driverId/:date
 * @access Admin and driver themselves
 */
exports.getDriverAssignment = async (req, res) => {
  const { driverId, date } = req.params;

  if (!mongoose.Types.ObjectId.isValid(driverId) || !date) {
    return res.status(400).json({ success: false, message: "Invalid driverId or date" });
  }

  // Authorization: admin or driver themselves
  if (req.user.role !== "admin" && req.user.id !== driverId) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  try {
    const assignment = await TruckAssignment.findOne({ driverId, date })
      .populate("truckId")
      .lean();

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "No assignment found for the given driver and date",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assignment found",
      data: assignment,
    });
  } catch (err) {
    logger.error("Get driver assignment error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Update a truck assignment by ID (Admin only)
 * @route PUT /api/truck-assignments/:assignmentId
 */
exports.updateAssignment = async (req, res) => {
  const { assignmentId } = req.params;
  const { truckId, driverId, date } = req.body;

  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return res.status(400).json({ success: false, message: "Invalid assignment ID" });
  }
  if (!mongoose.Types.ObjectId.isValid(truckId) || !mongoose.Types.ObjectId.isValid(driverId) || !date) {
    return res.status(400).json({ success: false, message: "Invalid input data" });
  }

  try {
    // Check for duplicate assignment (except current one)
    const duplicate = await TruckAssignment.findOne({
      _id: { $ne: assignmentId },
      truckId,
      driverId,
      date,
    });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "This truck is already assigned to this driver for the given date",
      });
    }

    const updated = await TruckAssignment.findByIdAndUpdate(
      assignmentId,
      { truckId, driverId, date },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      data: updated,
    });
  } catch (err) {
    logger.error("Update assignment error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Delete a truck assignment by ID (Admin only)
 * @route DELETE /api/truck-assignments/:assignmentId
 */
exports.deleteAssignment = async (req, res) => {
  const { assignmentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return res.status(400).json({ success: false, message: "Invalid assignment ID" });
  }

  try {
    const deleted = await TruckAssignment.findByIdAndDelete(assignmentId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (err) {
    logger.error("Delete assignment error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
