const JobPod = require("../models/jobPod");
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

/**
 * Upload a new POD PDF
 * Only Drivers can upload
 */
exports.uploadPOD = async (req, res) => {
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
          { resource_type: "raw", folder: "pods" },
          (error, result) => (result ? resolve(result) : reject(error))
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer);

    const newPOD = new JobPod({
      driverId,
      notes,
      fileUrl: result.secure_url,
      publicId: result.public_id,
    });

    await newPOD.save();
    return res.status(201).json({ success: true, message: "POD uploaded", data: newPOD });
  } catch (err) {
    logger.error("Upload POD error: %o", err);
    return res.status(500).json({ success: false, message: "Server error during upload" });
  }
};

/**
 * Get POD PDF by ID
 * Driver who uploaded or Admin can view
 */
exports.getPOD = async (req, res) => {
  try {
    const { podId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(podId)) {
      return res.status(400).json({ success: false, message: "Invalid POD ID" });
    }

    const pod = await JobPod.findById(podId);
    if (!pod) return res.status(404).json({ success: false, message: "POD not found" });

    const userId = req.user._id || req.user.id;
    if (req.user.role !== "admin" && pod.driverId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.status(200).json({ success: true, data: { url: pod.fileUrl } });
  } catch (err) {
    logger.error("Get POD error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * List PODs by driver
 */
exports.listPODsByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ success: false, message: "Invalid driver ID" });
    }

    const userId = req.user._id || req.user.id;
    if (req.user.role !== "admin" && userId.toString() !== driverId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const pods = await JobPod.find({ driverId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: pods });
  } catch (err) {
    logger.error("List PODs by driver error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Update POD notes
 */
exports.updatePOD = async (req, res) => {
  try {
    const { podId } = req.params;
    const { notes } = req.body;
    const userId = req.user._id || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(podId)) {
      return res.status(400).json({ success: false, message: "Invalid POD ID" });
    }

    const pod = await JobPod.findById(podId);
    if (!pod) return res.status(404).json({ success: false, message: "POD not found" });

    if (req.user.role !== "admin" && pod.driverId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    pod.notes = notes || pod.notes;
    await pod.save();

    return res.status(200).json({ success: true, message: "POD updated", data: pod });
  } catch (err) {
    logger.error("Update POD error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Delete POD
 */
exports.deletePOD = async (req, res) => {
  try {
    const { podId } = req.params;
    const userId = req.user._id || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(podId)) {
      return res.status(400).json({ success: false, message: "Invalid POD ID" });
    }

    const pod = await JobPod.findById(podId);
    if (!pod) return res.status(404).json({ success: false, message: "POD not found" });

    if (req.user.role !== "admin" && pod.driverId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (pod.publicId) {
      await cloudinary.uploader.destroy(pod.publicId, { resource_type: "raw" });
    }

    await JobPod.deleteOne({ _id: podId });

    return res.status(200).json({ success: true, message: "POD deleted" });
  } catch (err) {
    logger.error("Delete POD error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Admin: list all PODs
 */
exports.listAllPODs = async (req, res) => {
  try {
    const pods = await JobPod.find()
      .populate("driverId", "name email driverType role")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: pods });
  } catch (err) {
    logger.error("Admin listAllPODs error: %o", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
