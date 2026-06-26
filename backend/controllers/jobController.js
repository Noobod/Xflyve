const Job = require("../models/job");
const Driver = require("../models/driver");
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

const dateRangeFor = (value) => {
  const start = normalizeDateOnly(value);
  if (!start) return null;
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
};

const findTruckJobConflict = async ({ assignedTruck, jobDate, excludeJobId }) => {
  const range = dateRangeFor(jobDate);
  if (!range) return { type: "invalid-date" };

  return Job.findOne({
    assignedTruck,
    recordStatus: { $ne: "archived" },
    ...(excludeJobId ? { _id: { $ne: excludeJobId } } : {}),
    jobDate: { $gte: range.start, $lt: range.end },
  }).lean();
};

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
      customerName,
      customerReference,
      jobRate,
      invoiceStatus,
      recordStatus,
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

    const normalizedJobDate = normalizeDateOnly(jobDate);
    if (!normalizedJobDate) {
      return res.status(400).json({ status: "fail", message: "Invalid job date" });
    }

    // ✅ Prevent assigning the same truck twice on the same day
    const existingJob = await findTruckJobConflict({ assignedTruck, jobDate: normalizedJobDate });

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
      customerName: customerName?.trim(),
      customerReference: customerReference?.trim(),
      jobRate,
      invoiceStatus,
      recordStatus,
      assignedTo,
      assignedTruck,
      jobDate: normalizedJobDate,
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
    const jobs = await Job.find({ recordStatus: { $ne: "archived" } })
      .populate("assignedTo", "name email driverType")
      .populate("assignedTruck", "truckNumber")
      .lean();
    res.status(200).json({ status: "success", results: jobs.length, data: jobs });
  } catch (err) {
    logger.error("Get Jobs Error: %o", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

exports.getJobsReadyForInvoicing = async (req, res) => {
  try {
    const jobs = await Job.findReadyForInvoicing();
    const populatedJobs = await Job.populate(jobs, [
      { path: "assignedTo", select: "name email driverType" },
      { path: "assignedTruck", select: "truckNumber" },
      { path: "podIds" },
      { path: "diaryIds" },
    ]);

    res.status(200).json({
      status: "success",
      results: populatedJobs.length,
      data: populatedJobs,
    });
  } catch (err) {
    logger.error("Get Jobs Ready For Invoicing Error: %o", err);
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
    const jobs = await Job.find({ assignedTo: req.user.id, recordStatus: { $ne: "archived" } })
      .populate("assignedTruck", "truckNumber") // ✅ Added populate here
      .lean();

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
    const jobs = await Job.find({ assignedTo: driverId, recordStatus: { $ne: "archived" } })
      .populate("assignedTruck", "truckNumber") // ✅ Added populate here
      .lean();

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
      customerName,
      customerReference,
      jobRate,
      invoiceStatus,
      recordStatus,
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

    const nextAssignedTruck = assignedTruck !== undefined ? assignedTruck : job.assignedTruck;
    const nextJobDate = jobDate !== undefined ? normalizeDateOnly(jobDate) : job.jobDate;

    if (jobDate !== undefined && !nextJobDate) {
      return res.status(400).json({ status: "fail", message: "Invalid job date" });
    }

    if (assignedTruck !== undefined || jobDate !== undefined) {
      const existingJob = await findTruckJobConflict({
        assignedTruck: nextAssignedTruck,
        jobDate: nextJobDate,
        excludeJobId: jobId,
      });

      if (existingJob) {
        return res.status(400).json({
          status: "fail",
          message: "This truck is already assigned to another job on the selected date",
        });
      }
    }

    job.title = title !== undefined ? title : job.title;
    job.description = description !== undefined ? description : job.description;
    job.pickupLocation = pickupLocation !== undefined ? pickupLocation : job.pickupLocation;
    job.deliveryLocation = deliveryLocation !== undefined ? deliveryLocation : job.deliveryLocation;
    job.customerName = customerName !== undefined ? customerName : job.customerName;
    job.customerReference = customerReference !== undefined ? customerReference : job.customerReference;
    job.jobRate = jobRate !== undefined ? jobRate : job.jobRate;
    job.invoiceStatus = invoiceStatus !== undefined ? invoiceStatus : job.invoiceStatus;
    job.recordStatus = recordStatus !== undefined ? recordStatus : job.recordStatus;
    job.assignedTo = assignedTo !== undefined ? assignedTo : job.assignedTo;
    job.assignedTruck = nextAssignedTruck;
    job.jobDate = nextJobDate;
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

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ status: "fail", message: "Job not found" });
    }

    if (job.status === "in-progress") {
      return res.status(409).json({
        status: "fail",
        message: "Cannot delete a job that is currently in progress",
      });
    }

    job.recordStatus = "archived";
    await job.save();

    res.status(200).json({ status: "success", message: "Job archived", data: job });
  } catch (err) {
    logger.error("Delete Job Error: %o", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};
