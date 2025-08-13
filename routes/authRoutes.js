const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware"); // <-- Import this
const { signupValidator, loginValidator } = require("../validators/authValidator");
const validateRequest = require("../middlewares/validateRequest");

// Register a new driver
router.post("/signup", signupValidator, validateRequest, authController.signup);

// Login driver/admin
router.post("/login", loginValidator, validateRequest, authController.login);

// Get logged-in user profile (protected route)
router.get("/profile", authMiddleware, authController.getProfile);

module.exports = router;
