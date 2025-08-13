const mongoose = require("mongoose");
const Truck = require("../models/truck");
const logger = require("../utils/logger");

/**
 * @desc Get all trucks
 * @route GET /api/trucks
 * @access Admin only (or configurable)
 */
exports.getAllTrucks = async (req, res) => {
  try {
    const trucks = await Truck.find()
      .populate("assignedDriver", "name email")
      .lean();

    return res.status(200).json({
      success: true,
      message: "All trucks fetched",
      data: trucks,
    });
  } catch (err) {
    logger.error("Get all trucks error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Add a new truck
 * @route POST /api/trucks
 * @access Admin only
 */
exports.addTruck = async (req, res) => {
  try {
    const { truckNumber, model, capacity, status, assignedDriver, lastMaintenanceDate } = req.body;

    const newTruck = new Truck({
      truckNumber,
      model,
      capacity,
      status,
      assignedDriver,
      lastMaintenanceDate,
    });

    await newTruck.save();

    return res.status(201).json({
      success: true,
      message: "Truck added",
      data: newTruck,
    });
  } catch (err) {
    logger.error("Add truck error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Update a truck by ID
 * @route PUT /api/trucks/:truckId
 * @access Admin only
 */
exports.updateTruck = async (req, res) => {
  const { truckId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(truckId)) {
    return res.status(400).json({ success: false, message: "Invalid truck ID" });
  }

  try {
    const updatedTruck = await Truck.findByIdAndUpdate(truckId, req.body, { new: true });

    if (!updatedTruck) {
      return res.status(404).json({ success: false, message: "Truck not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Truck updated",
      data: updatedTruck,
    });
  } catch (err) {
    logger.error("Update truck error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Delete a truck by ID
 * @route DELETE /api/trucks/:truckId
 * @access Admin only
 */
exports.deleteTruck = async (req, res) => {
  const { truckId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(truckId)) {
    return res.status(400).json({ success: false, message: "Invalid truck ID" });
  }

  try {
    const deleted = await Truck.findByIdAndDelete(truckId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Truck not found" });
    }

    return res.status(200).json({ success: true, message: "Truck deleted" });
  } catch (err) {
    logger.error("Delete truck error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
