const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware"); // JWT verify middleware
const { requireAdmin } = require("../middlewares/roleMiddleware");

// Protect routes: authenticate first, then authorize as admin
router.get("/drivers", authMiddleware, requireAdmin, adminController.getAllDrivers);
router.post("/drivers", authMiddleware, requireAdmin, adminController.createDriver);
router.delete("/drivers/:driverId", authMiddleware, requireAdmin, adminController.deleteDriver);
router.get("/export-drivers", authMiddleware, requireAdmin, adminController.exportDriversExcel);
router.get("/stats", authMiddleware, requireAdmin, adminController.getSystemStats);
router.get("/download-all-pods", authMiddleware, requireAdmin, adminController.downloadAllPods);

module.exports = router;
