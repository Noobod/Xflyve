const Job = require("../models/job");
const Driver = require("../models/driver");
const logger = require("../utils/logger");

// @desc    Create a new job
// @route   POST /api/jobs/create
// @access  Admin
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      pickupLocation,
      deliveryLocation,
      assignedTo,
      assignedTruck,
      jobDate,
      jobType,
    } = req.body;

    // Check if assigned driver exists
    const driver = await Driver.findById(assignedTo).lean();
    if (!driver) {
      return res.status(404).json({ status: "fail", message: "Driver not found" });
    }

    if (!assignedTruck) {
      return res.status(400).json({ status: "fail", message: "Assigned truck is required" });
    }

    if (!jobDate) {
      return res.status(400).json({ status: "fail", message: "Job date is required" });
    }

    // ✅ Prevent assigning the same truck twice on the same day
    const existingJob = await Job.findOne({
      assignedTruck,
      jobDate: {
        $gte: new Date(new Date(jobDate).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(jobDate).setHours(23, 59, 59, 999)),
      },
    });

    if (existingJob) {
      return res.status(400).json({
        status: "fail",
        message: "This truck is already assigned to another job on the selected date",
      });
    }

    const newJob = await Job.create({
      title: title.trim(),
      description: description?.trim(),
      pickupLocation: pickupLocation.trim(),
      deliveryLocation: deliveryLocation.trim(),
      assignedTo,
      assignedTruck,
      jobDate: new Date(jobDate),
      jobType,
      status: "pending",
    });

    res.status(201).json({ status: "success", data: newJob });
  } catch (err) {
    logger.error("Create Job Error: %o", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};


// @desc    Get all jobs (admin only)
// @route   GET /api/jobs
// @access  Admin
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("assignedTo", "name email driverType")
      .populate("assignedTruck", "truckNumber")
      .lean();
    res.status(200).json({ status: "success", results: jobs.length, data: jobs });
  } catch (err) {
    logger.error("Get Jobs Error: %o", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// @desc    Get a job by ID
// @route   GET /api/jobs/:jobId
// @access  Admin or Assigned Driver
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)
      .populate("assignedTo", "name email")
      .populate("assignedTruck", "truckNumber")
      .lean();

    if (!job) {
      return res.status(404).json({ status: "fail", message: "Job not found" });
    }

    if (req.user.role === "driver" && job.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({ status: "fail", message: "Access denied" });
    }

    res.status(200).json({ status: "success", data: job });
  } catch (err) {
    logger.error("Get Job by ID Error: %o", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// @desc    Mark job as completed
// @route   PUT /api/jobs/complete/:jobId
// @access  Assigned Driver
exports.markJobComplete = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ status: "fail", message: "Job not found" });
    }

    if (req.user.role !== "driver" || job.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ status: "fail", message: "Unauthorized" });
    }

    if (job.status === "completed") {
      return res.status(400).json({ status: "fail", message: "Job is already completed" });
    }

    job.status = "completed";
    await job.save();

    res.status(200).json({ status: "success", message: "Job marked as completed" });
  } catch (err) {
    logger.error("Mark Job Complete Error: %o", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// @desc    Get jobs assigned to logged-in driver
// @route   GET /api/jobs/driver
// @access  Driver
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ assignedTo: req.user.id }).lean();
    res.status(200).json({ status: "success", results: jobs.length, data: jobs });
  } catch (err) {
    logger.error("Get Driver Jobs Error: %o", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// @desc    Get jobs assigned to a specific driver by driverId param
// @route   GET /api/jobs/assigned/:driverId
// @access  Driver (self) or Admin
exports.getAssignedJobs = async (req, res) => {
  try {
    const driverId = req.params.driverId;
    const jobs = await Job.find({ assignedTo: driverId }).lean();
    res.status(200).json({ status: "success", results: jobs.length, data: jobs });
  } catch (err) {
    logger.error("Get Assigned Jobs Error: %o", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// ===== Update a job by ID (Admin or Driver)
exports.updateJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const user = req.user;
    const {
      title,
      description,
      pickupLocation,
      deliveryLocation,
      assignedTo,
      assignedTruck,
      jobDate,
      jobType,
      status,
    } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ status: "fail", message: "Job not found" });
    }

    if (user.role === "driver") {
      // Driver can only update status of own jobs
      if (job.assignedTo.toString() !== user.id) {
        return res.status(403).json({ status: "fail", message: "Unauthorized" });
      }

      const allowedStatuses = ["pending", "in-progress", "completed"];
      if (status && allowedStatuses.includes(status)) {
        job.status = status;
        await job.save();
        return res.status(200).json({ status: "success", data: job });
      } else {
        return res.status(400).json({ status: "fail", message: "Invalid status update" });
      }
    }

    // Admin can update all fields; validate assignedTo if provided
    if (assignedTo) {
      const driver = await Driver.findById(assignedTo).lean();
      if (!driver) {
        return res.status(404).json({ status: "fail", message: "Driver not found" });
      }
    }

    job.title = title !== undefined ? title : job.title;
    job.description = description !== undefined ? description : job.description;
    job.pickupLocation = pickupLocation !== undefined ? pickupLocation : job.pickupLocation;
    job.deliveryLocation = deliveryLocation !== undefined ? deliveryLocation : job.deliveryLocation;
    job.assignedTo = assignedTo !== undefined ? assignedTo : job.assignedTo;
    job.assignedTruck = assignedTruck !== undefined ? assignedTruck : job.assignedTruck;
    job.jobDate = jobDate !== undefined ? new Date(jobDate) : job.jobDate;
    job.jobType = jobType !== undefined ? jobType : job.jobType;
    job.status = status !== undefined ? status : job.status;

    await job.save();

    const updatedJob = await Job.findById(jobId)
      .populate("assignedTo", "name email driverType")
      .populate("assignedTruck", "truckNumber");

    res.status(200).json({ status: "success", data: updatedJob });
  } catch (err) {
    logger.error("Update Job Error: %o", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// ===== Delete a job by ID (Admin only)
exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    const deletedJob = await Job.findByIdAndDelete(jobId);

    if (!deletedJob) {
      return res.status(404).json({ status: "fail", message: "Job not found" });
    }

    res.status(200).json({ status: "success", message: "Job deleted successfully" });
  } catch (err) {
    logger.error("Delete Job Error: %o", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};
