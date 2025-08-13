// authValidator.js
const { body } = require("express-validator");

// Signup input validation rules
exports.signupValidator = [
  body("name").trim().notEmpty().withMessage("Name is required").escape(),
  body("email").trim().normalizeEmail().isEmail().withMessage("Valid email is required"),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("driverType")
    .trim()
    .isIn(["local", "interstate"])
    .withMessage("driverType must be 'local' or 'interstate'"),
];

// Login input validation rules
exports.loginValidator = [
  body("email").trim().normalizeEmail().isEmail().withMessage("Valid email is required"),
  body("password").trim().notEmpty().withMessage("Password is required"),
];

// New driver creation validator (for admin create driver)
exports.driverCreationValidator = [
  body("name").trim().notEmpty().withMessage("Name is required").escape(),
  body("email").trim().normalizeEmail().isEmail().withMessage("Valid email is required"),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("driverType")
    .trim()
    .isIn(["local", "interstate"])
    .withMessage("driverType must be 'local' or 'interstate'"),
];