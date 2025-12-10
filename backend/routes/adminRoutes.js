const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/roleMiddleware");
const Driver = require("../models/driver");

/* ==========================================================
   🔐 PROTECTED ADMIN ROUTES (Requires Token + Admin Role)
   ========================================================== */
router.get("/drivers", authMiddleware, requireAdmin, adminController.getAllDrivers);
router.post("/drivers", authMiddleware, requireAdmin, adminController.createDriver);
router.delete("/drivers/:driverId", authMiddleware, requireAdmin, adminController.deleteDriver);
router.get("/export-drivers", authMiddleware, requireAdmin, adminController.exportDriversExcel);
router.get("/stats", authMiddleware, requireAdmin, adminController.getSystemStats);
router.get("/download-all-pods", authMiddleware, requireAdmin, adminController.downloadAllPods);

/* ==========================================================
   🔥 TEMPORARY PUBLIC ROUTE FOR PRESENTATION PURPOSES
   Shows 100–500 fake users without requiring login
   ========================================================== */
router.get("/show-all-drivers", async (req, res) => {
  try {
    // Limit to 500 if you seeded 500 users, adjust if needed
    const drivers = await Driver.find().limit(500);

    return res.json({
      success: true,
      total: drivers.length,
      data: drivers,
    });
  } catch (err) {
    console.error("Error fetching drivers:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching drivers",
      error: err.toString(),
    });
  }
});

module.exports = router;
