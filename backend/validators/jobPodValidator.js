const { body, param } = require("express-validator");

// Driver ownership is derived from JWT in the controller.
exports.uploadPODValidator = [
  body("jobId").optional().isMongoId().withMessage("Valid jobId is required"),
  body("notes").optional().isString().withMessage("Notes must be a string"),
];

// Validate POD ID in URL param
exports.podIdValidator = [
  param("podId").isMongoId().withMessage("Valid POD ID is required"),
];

// Validate driverId in URL param (fetch PODs by driver)
exports.podDriverIdParamValidator = [
  param("driverId").isMongoId().withMessage("Valid driverId is required"),
];

// Validate notes update on POD
exports.updatePODNotesValidator = [
  param("podId").isMongoId().withMessage("Valid POD ID is required"),
  body("notes").optional().isString().withMessage("Notes must be a string"),
];

exports.rejectPODValidator = [
  param("podId").isMongoId().withMessage("Valid POD ID is required"),
  body("rejectionReason").trim().notEmpty().withMessage("Rejection reason is required"),
];
