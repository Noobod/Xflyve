const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/roleMiddleware");
const {
  assignPermanentTruck,
  getPermanentTruck,
} = require("../controllers/permanentAssignController");
const validateMongoId = require("../validators/validateMongoId");

router.use(authMiddleware);

// Admin-only: assign or update permanent truck
router.post("/assign", requireAdmin, assignPermanentTruck);

// GET permanent truck assigned to driver
// Allow admin or driver themselves
router.get(
  "/:driverId",
  validateMongoId("driverId"),
  (req, res, next) => {
    if (req.user.role !== "admin" && req.user.id !== req.params.driverId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  },
  getPermanentTruck
);

module.exports = router;
