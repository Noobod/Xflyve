const { body, param } = require("express-validator");

exports.uploadWorkDiaryValidator = [
  body("driverId").isMongoId().withMessage("Valid driverId is required"),
];

exports.workDiaryIdValidator = [
  param("id").isMongoId().withMessage("Valid Work Diary ID is required"),
];

exports.driverIdParamValidator = [
  param("driverId").isMongoId().withMessage("Valid driverId is required"),
];

exports.updateWorkDiaryNotesValidator = [
  param("id").isMongoId().withMessage("Valid Work Diary ID is required"),
  body("notes").optional().isString().withMessage("Notes must be a string"),
];