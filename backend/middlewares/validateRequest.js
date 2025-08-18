const { validationResult } = require("express-validator");

/**
 * Middleware to handle validation errors from express-validator.
 * Sends 422 with formatted error messages if validation fails.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = validateRequest;
