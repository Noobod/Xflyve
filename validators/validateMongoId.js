const mongoose = require("mongoose");

const validateMongoId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName}`,
      });
    }
    next();
  };
};

module.exports = validateMongoId;
