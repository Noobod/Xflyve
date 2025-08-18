const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { requireDriver, requireAdmin } = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/jobPodMiddleware");
const jobPodController = require("../controllers/jobPodController");
const validateMongoId = require("../validators/validateMongoId");

router.use(authMiddleware);

/**
 * Upload a POD PDF file for a job
 * Only driver assigned or admin allowed
 */
router.post(
  "/upload",
  requireDriver,
  upload.single("podFile"),
  jobPodController.uploadPODByDriver
);


/**
 * Get POD file for a job
 * Only admin or driver who uploaded the POD
 */
router.get(
  "/:jobId",
  validateMongoId("jobId"),
  jobPodController.getPOD
);

// ** New: Admin get all PODs with driver info **
router.get(
  "/admin/all",
  requireAdmin,
  jobPodController.getAllPODsForAdmin
);

module.exports = router;

// Delete POD for a job
router.delete(
  "/:jobId",
  requireDriver, // or requireAdmin if admin can also delete
  validateMongoId("jobId"),
  jobPodController.deletePOD
);

// Update/Overwrite POD for a job
router.put(
  "/upload/:jobId",
  requireDriver,
  validateMongoId("jobId"),
  upload.single("podFile"),
  jobPodController.updatePOD
);
