const { body, param } = require("express-validator");

// Validate driverId in body for POD upload
exports.uploadPODValidator = [
  body("driverId").isMongoId().withMessage("Valid driverId is required"),
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