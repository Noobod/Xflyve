// truckAssignValidator.js
const { body } = require("express-validator");

// No inline validationResult here — errors handled by validateRequest middleware
exports.validateTruckAssignment = [
  body("truckId").isMongoId().withMessage("Valid truckId is required"),
  body("driverId").isMongoId().withMessage("Valid driverId is required"),
  body("date").isISO8601().toDate().withMessage("Valid ISO date (YYYY-MM-DD) is required"),
];
