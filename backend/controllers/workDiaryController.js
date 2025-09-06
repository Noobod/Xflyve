const WorkDiary = require("../models/workDiary");
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

/**
 * Upload a new Work Diary PDF to Cloudinary
 */
exports.uploadWorkDiary = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "PDF file is required" });
    }

    const { driverId, notes } = req.body;

    if (!driverId || !mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ success: false, message: "Valid driverId is required" });
    }

    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "raw", folder: "work_diaries" },
          (error, result) => (result ? resolve(result) : reject(error))
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer);

    const newDiary = new WorkDiary({
      driverId,
      notes,
      fileUrl: result.secure_url,
      publicId: result.public_id,
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
 * Get work diary by ID
 */
exports.getWorkDiary = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid work diary ID" });
    }

    const workDiary = await WorkDiary.findById(id);
    if (!workDiary) return res.status(404).json({ success: false, message: "Work diary not found" });

    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.status(200).json({ success: true, data: workDiary });
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid work diary ID" });
    }

    const workDiary = await WorkDiary.findById(id);
    if (!workDiary) return res.status(404).json({ success: false, message: "Work diary not found" });

    if (req.user.role !== "admin" && workDiary.driverId.toString() !== userId.toString()) {
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
 * Delete a work diary from Cloudinary
 */
exports.deleteWorkDiary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid work diary ID" });
    }

    const workDiary = await WorkDiary.findById(id);
    if (!workDiary) return res.status(404).json({ success: false, message: "Work diary not found" });

    if (req.user.role !== "admin" && workDiary.driverId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (workDiary.publicId) {
      await cloudinary.uploader.destroy(workDiary.publicId, { resource_type: "raw" });
    }

    await WorkDiary.deleteOne({ _id: id });

    res.status(200).json({ success: true, message: "Work diary deleted" });
  } catch (err) {
    logger.error("Delete work diary error: %o", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
