// workLogValidator.js
const { body } = require("express-validator");

exports.validateWorkLog = [
  body("date").isISO8601().toDate().withMessage("Valid date is required"),
  body("hours").optional().isFloat({ min: 0 }).withMessage("Hours must be a non-negative number"),
  body("kilometers").optional().isFloat({ min: 0 }).withMessage("Kilometers must be a non-negative number"),
  body("notes").optional().isString(),
  body("jobIds").optional().isArray().withMessage("jobIds must be an array"),
];
