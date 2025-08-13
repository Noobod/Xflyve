const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  requireDriver,
  requireAdmin,
  requireDriverOrAdmin, // import the new middleware
} = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/workDiaryMiddleware");
const workDiaryController = require("../controllers/workDiaryController");
const {
  uploadWorkDiaryValidator,
  workDiaryIdValidator,
  driverIdParamValidator,
} = require("../validators/workDiaryValidator");
const validateRequest = require("../middlewares/validateRequest");

router.use(authMiddleware);

// Upload work diary PDF (Driver only)
router.post(
  "/upload",
  requireDriver,
  upload.single("workDiaryFile"),
  ...uploadWorkDiaryValidator,
  validateRequest,
  workDiaryController.uploadWorkDiary
);

// Get work diary PDF by ID (Driver or Admin) <-- Changed middleware here
router.get(
  "/:id",
  requireDriverOrAdmin,
  ...workDiaryIdValidator,
  validateRequest,
  workDiaryController.getWorkDiary
);

// List all work diaries by driver (Driver or Admin) <-- unchanged, because controller handles permission
router.get(
  "/driver/:driverId",
  ...driverIdParamValidator,
  validateRequest,
  workDiaryController.listWorkDiariesByDriver
);

// Update work diary notes (Driver or Admin) <-- Changed middleware here
router.put(
  "/:id",
  requireDriverOrAdmin,
  ...workDiaryIdValidator,
  validateRequest,
  workDiaryController.updateWorkDiary
);

// Delete a work diary (Driver or Admin) <-- Changed middleware here
router.delete(
  "/:id",
  requireDriverOrAdmin,
  ...workDiaryIdValidator,
  validateRequest,
  workDiaryController.deleteWorkDiary
);

module.exports = router;
