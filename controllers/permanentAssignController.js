const mongoose = require("mongoose");
const PermanentTruckAssignment = require("../models/permanentTruckAssignment");
const Truck = require("../models/truck");
const Driver = require("../models/driver");

const logger = require("../utils/logger");

/**
 * @desc Assign or update a permanent truck to a driver
 * @route POST /api/permanent-assign
 * @access Admin only
 */
exports.assignPermanentTruck = async (req, res) => {
  const { driverId, truckId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(driverId) || !mongoose.Types.ObjectId.isValid(truckId)) {
    return res.status(400).json({ success: false, message: "Invalid driver or truck ID" });
  }

  try {
    const driver = await Driver.findById(driverId).lean();
    if (!driver) return res.status(404).json({ success: false, message: "Driver not found" });

    const truck = await Truck.findById(truckId).lean();
    if (!truck) return res.status(404).json({ success: false, message: "Truck not found" });

    let existingAssignment = await PermanentTruckAssignment.findOne({ driver: driverId });

    if (existingAssignment) {
      existingAssignment.truck = truckId;
      existingAssignment.assignedBy = req.user.id;
      await existingAssignment.save();

      return res.status(200).json({
        success: true,
        message: "Permanent truck assignment updated",
        data: existingAssignment,
      });
    }

    const newAssignment = await PermanentTruckAssignment.create({
      driver: driverId,
      truck: truckId,
      assignedBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Permanent truck assigned",
      data: newAssignment,
    });
  } catch (err) {
    logger.error("Permanent truck assignment error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Get permanent truck assigned to a driver
 * @route GET /api/permanent-assign/:driverId
 * @access Admin and driver themselves
 */
exports.getPermanentTruck = async (req, res) => {
  const { driverId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(driverId)) {
    return res.status(400).json({ success: false, message: "Invalid driver ID" });
  }

  // Authorization: only admin or the driver themselves
  if (req.user.role !== "admin" && req.user.id !== driverId) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  try {
    const assignment = await PermanentTruckAssignment.findOne({ driver: driverId })
      .populate("truck")
      .lean();

    if (!assignment) {
      return res.status(404).json({ success: false, message: "No assignment found" });
    }

    return res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    logger.error("Get permanent truck error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
