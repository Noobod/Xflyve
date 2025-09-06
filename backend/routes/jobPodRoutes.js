const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  requireDriver,
  requireAdmin,
  requireDriverOrAdmin,
} = require("../middlewares/roleMiddleware");
const upload = require("../config/multer"); // multer
const jobPodController = require("../controllers/jobPodController");
const validateRequest = require("../middlewares/validateRequest");
const {
  uploadPODValidator,
  podIdValidator,
  podDriverIdParamValidator,
  updatePODNotesValidator,
} = require("../validators/jobPodValidator");

router.use(authMiddleware);

// Driver routes
router.post(
  "/upload",
  requireDriver,
  upload.single("podFile"),
  ...uploadPODValidator,
  validateRequest,
  jobPodController.uploadPOD
);

router.get(
  "/:podId",
  requireDriverOrAdmin,
  ...podIdValidator,
  validateRequest,
  jobPodController.getPOD
);

router.get(
  "/driver/:driverId",
  requireDriverOrAdmin,
  ...podDriverIdParamValidator,
  validateRequest,
  jobPodController.listPODsByDriver
);

router.put(
  "/:podId",
  requireDriverOrAdmin,
  ...podIdValidator,
  ...updatePODNotesValidator,
  validateRequest,
  jobPodController.updatePOD
);

router.delete(
  "/:podId",
  requireDriverOrAdmin,
  ...podIdValidator,
  validateRequest,
  jobPodController.deletePOD
);

// Admin route
router.get("/admin/all", requireAdmin, jobPodController.listAllPODs);

module.exports = router;
