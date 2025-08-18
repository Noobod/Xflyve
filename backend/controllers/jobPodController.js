const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Job = require("../models/job");
const JobPod = require("../models/jobPod");

const logger = require("../utils/logger");
const deleteFile = require("../utils/fileCleaner");

/**
 * @desc Upload POD PDF for a job by a driver
 * @route POST /api/jobpods/upload/:jobId
 * @access Driver (assigned) or Admin
 */
exports.uploadPODByDriver = async (req, res) => {
  const jobId = req.body.jobId || req.params.jobId;

  if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
    if (req.file) await deleteFile(req.file.path);
    return res.status(400).json({ status: "fail", message: "Invalid or missing jobId" });
  }

  if (!req.file) return res.status(400).json({ status: "fail", message: "No file uploaded" });

  try {
    const job = await Job.findById(jobId).lean();
    if (!job) {
      await deleteFile(req.file.path);
      return res.status(404).json({ status: "fail", message: "Job not found" });
    }

    if (req.user.role !== "admin" && req.user.id !== job.assignedTo.toString()) {
      await deleteFile(req.file.path);
      return res.status(403).json({ status: "fail", message: "Forbidden" });
    }

    const podRecord = await JobPod.findOneAndUpdate(
      { jobId: job._id, driverId: req.user.id },
      { podFilePath: req.file.path, uploadedAt: new Date() },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      status: "success",
      message: "POD uploaded successfully",
      data: podRecord,
    });
  } catch (err) {
    if (req.file) await deleteFile(req.file.path);
    logger.error("POD upload error: %o", err);
    return res.status(500).json({ status: "error", message: "Server error during POD upload" });
  }
};

/**
 * @desc Get POD file for a job
 * @route GET /api/jobpods/:jobId
 * @access Admin or driver who uploaded POD
 */
exports.getPOD = async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ status: "fail", message: "Invalid jobId" });
  }

  try {
    const podRecord = await JobPod.findOne({ jobId }).lean();
    if (!podRecord) {
      return res.status(404).json({ status: "fail", message: "POD not found" });
    }

    if (req.user.role !== "admin" && req.user.id !== podRecord.driverId.toString()) {
      return res.status(403).json({ status: "fail", message: "Forbidden" });
    }

    if (!podRecord.podFilePath) {
      return res.status(404).json({ status: "fail", message: "POD file path missing" });
    }

    const filePath = path.resolve(podRecord.podFilePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ status: "fail", message: "POD file not found on server" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="pod.pdf"');

    res.sendFile(filePath, (err) => {
      if (err) {
        logger.error("Send POD file error: %o", err);
        return res.status(500).json({ status: "error", message: "Error sending POD file" });
      }
    });
  } catch (err) {
    logger.error("Get POD error: %o", err);
    return res.status(500).json({ status: "error", message: "Server error while fetching POD" });
  }
};

/**
 * @desc Get all PODs with driver info for admin
 * @route GET /api/jobpods/admin/all
 * @access Admin only
 */
exports.getAllPODsForAdmin = async (req, res) => {
  try {
    const pods = await JobPod.find({})
      .populate("driverId", "name email")
      .populate("jobId", "jobName jobNumber")
      .lean();

    return res.status(200).json({
      status: "success",
      data: pods,
    });
  } catch (err) {
    logger.error("Get all PODs for admin error: %o", err);
    return res.status(500).json({ status: "error", message: "Server error while fetching all PODs" });
  }
};

// Delete POD
exports.deletePOD = async (req, res) => {
  const { jobId } = req.params;
  try {
    const podRecord = await JobPod.findOne({ jobId, driverId: req.user.id });
    if (!podRecord) return res.status(404).json({ status: "fail", message: "POD not found" });

    // Delete file from server
    if (podRecord.podFilePath) {
      await deleteFile(podRecord.podFilePath);
    }

    // Remove record
    await JobPod.deleteOne({ _id: podRecord._id });

    res.status(200).json({ status: "success", message: "POD deleted successfully" });
  } catch (err) {
    logger.error("Delete POD error: %o", err);
    res.status(500).json({ status: "error", message: "Server error while deleting POD" });
  }
};

// Update POD
exports.updatePOD = async (req, res) => {
  const { jobId } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ status: "fail", message: "No file uploaded" });

  try {
    const podRecord = await JobPod.findOne({ jobId, driverId: req.user.id });
    if (!podRecord) return res.status(404).json({ status: "fail", message: "POD not found" });

    // Delete old file
    if (podRecord.podFilePath) await deleteFile(podRecord.podFilePath);

    // Update with new file
    podRecord.podFilePath = file.path;
    podRecord.uploadedAt = new Date();
    await podRecord.save();

    res.status(200).json({ status: "success", message: "POD updated successfully", data: podRecord });
  } catch (err) {
    if (file) await deleteFile(file.path);
    logger.error("Update POD error: %o", err);
    res.status(500).json({ status: "error", message: "Server error while updating POD" });
  }
};
