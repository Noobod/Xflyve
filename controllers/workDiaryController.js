const WorkDiary = require("../models/workDiary");
const fs = require("fs").promises;
const mongoose = require("mongoose");
const logger = require("../utils/logger");

/**
 * Upload a new Work Diary PDF
 */
exports.uploadWorkDiary = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "PDF file is required" });
    }

    const { driverId, notes } = req.body;

    if (!driverId || !mongoose.Types.ObjectId.isValid(driverId)) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkErr) {
        logger.error("Error deleting orphaned work diary file: %o", unlinkErr);
      }
      return res.status(400).json({ success: false, message: "Valid driverId is required" });
    }

    const newDiary = new WorkDiary({
      driverId,
      notes,
      filePath: req.file.path,
      uploadDate: new Date(),
    });

    await newDiary.save();

    return res.status(201).json({ success: true, message: "Work diary uploaded", data: newDiary });
  } catch (err) {
    logger.error("Upload work diary error: %o", err);
    return res.status(500).json({ success: false, message: "Server error during upload" });
  }
};

/**
 * Get work diary PDF by ID
 */
exports.getWorkDiary = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid work diary ID" });
    }

    const workDiary = await WorkDiary.findById(id);
    if (!workDiary) {
      return res.status(404).json({ success: false, message: "Work diary not found" });
    }

    // Only admin can download/view the PDF
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.setHeader("Content-Type", "application/pdf");
    const fileBuffer = await fs.readFile(workDiary.filePath);
    return res.send(fileBuffer);
  } catch (err) {
    logger.error("Get work diary error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * List all work diaries for a driver
 */
exports.listWorkDiariesByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ success: false, message: "Invalid driver ID" });
    }

    const userId = req.user._id || req.user.id;

    if (req.user.role !== "admin" && userId.toString() !== driverId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const workDiaries = await WorkDiary.find({ driverId });
    return res.status(200).json({ success: true, data: workDiaries });
  } catch (err) {
    logger.error("List work diaries by driver error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Update work diary notes (driver or admin)
 */
exports.updateWorkDiary = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid work diary ID" });
    }

    const workDiary = await WorkDiary.findById(id);
    if (!workDiary) {
      return res.status(404).json({ success: false, message: "Work diary not found" });
    }

    if (userRole !== "admin" && workDiary.driverId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    workDiary.notes = notes || workDiary.notes;
    await workDiary.save();

    res.status(200).json({ success: true, message: "Work diary updated", data: workDiary });
  } catch (err) {
    logger.error("Update work diary error: %o", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Delete a work diary and its PDF file (driver or admin)
 */
exports.deleteWorkDiary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid work diary ID" });
    }

    const workDiary = await WorkDiary.findById(id);
    if (!workDiary) {
      return res.status(404).json({ success: false, message: "Work diary not found" });
    }

    if (userRole !== "admin" && workDiary.driverId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    try {
      await fs.unlink(workDiary.filePath);
    } catch (err) {
      logger.error("Error deleting work diary file: %o", err);
    }

    await WorkDiary.deleteOne({ _id: id });

    res.status(200).json({ success: true, message: "Work diary deleted" });
  } catch (err) {
    logger.error("Delete work diary error: %o", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
