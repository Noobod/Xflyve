// jobValidator.js
const { body } = require("express-validator");

// Validation for creating a job
exports.createJobValidator = [
  body("title").trim().notEmpty().withMessage("Title is required").escape(),
  body("description").trim().notEmpty().withMessage("Description is required").escape(),
  body("pickupLocation").trim().notEmpty().withMessage("Pickup location is required").escape(),
  body("deliveryLocation").trim().notEmpty().withMessage("Delivery location is required").escape(),
  body("assignedTo").isMongoId().withMessage("Valid driver ID is required"),
  body("jobType").isIn(["interstate", "local"]).withMessage("Job type must be 'interstate' or 'local'"),
];

// Validation for updating a job (all fields optional but validated if present)
exports.updateJobValidator = [
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty").escape(),
  body("description").optional().trim().notEmpty().withMessage("Description cannot be empty").escape(),
  body("pickupLocation").optional().trim().notEmpty().withMessage("Pickup location cannot be empty").escape(),
  body("deliveryLocation").optional().trim().notEmpty().withMessage("Delivery location cannot be empty").escape(),
  body("assignedTo").optional().isMongoId().withMessage("Valid driver ID is required"),
  body("status").optional().isIn(["pending", "in-progress", "completed"]).withMessage("Invalid status"),
  body("jobType").optional().isIn(["interstate", "local"]).withMessage("Job type must be 'interstate' or 'local'"),
];