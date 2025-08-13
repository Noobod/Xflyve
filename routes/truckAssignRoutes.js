const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/roleMiddleware");
const truckAssignController = require("../controllers/truckAssignController");
const { validateTruckAssignment } = require("../validators/truckAssignValidator");
const validateMongoId = require("../validators/validateMongoId");

router.use(authMiddleware);

router.get("/test", (req, res) => {
  res.json({ success: true, message: "TruckAssign test route works" });
});

// Admin-only: assign truck
router.post("/", requireAdmin, validateTruckAssignment, truckAssignController.assignTruck);

// Admin-only: get all assignments
router.get("/", requireAdmin, truckAssignController.getAllAssignments);

// Driver or Admin: get driver's truck assignment for date
router.get(
  "/:driverId/:date",
  validateMongoId("driverId"),
  (req, res, next) => {
    if (req.user.role !== "admin" && req.user.id !== req.params.driverId) {
      return res.status(403).json({ status: "fail", message: "Forbidden" });
    }
    next();
  },
  truckAssignController.getDriverAssignment
);

// Admin-only: update assignment by ID
router.put(
  "/:assignmentId",
  requireAdmin,
  validateMongoId("assignmentId"),
  validateTruckAssignment,
  truckAssignController.updateAssignment
);

// Admin-only: delete assignment by ID
router.delete(
  "/:assignmentId",
  requireAdmin,
  validateMongoId("assignmentId"),
  truckAssignController.deleteAssignment
);

module.exports = router;
