require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const path = require("path");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");

const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");

// Routes
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const workLogRoutes = require("./routes/workLogRoutes");
const truckRoutes = require("./routes/truckRoutes");
const truckAssignRoutes = require("./routes/truckAssignRoutes");
const jobPodRoutes = require("./routes/jobPodRoutes");
const adminRoutes = require("./routes/adminRoutes");
const workDiaryRoutes = require("./routes/workDiaryRoutes");
const permanentAssignRoutes = require("./routes/permanentAssignRoutes");

const app = express();

app.disable("x-powered-by");

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
      retryAfter: 15 * 60, // seconds
    });
  },
});
app.use(limiter);

// Validate critical ENV
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  throw new Error("Missing essential environment variables (JWT_SECRET, MONGO_URI)");
}

// CORS whitelist
const allowedOrigins = (process.env.CORS_WHITELIST || process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map(origin => origin.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow Postman, curl, etc.
      if (!allowedOrigins.includes(origin)) {
        logger.warn(`CORS blocked: ${origin}`);
        return callback(new Error("CORS policy does not allow access from this origin."), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Serve uploads with cache headers
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "public, max-age=3600"); // 1 hour
    },
  })
);

// Health check
app.get("/test", (req, res) => {
  res.send("Xflyve Test Route Working");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/worklogs", workLogRoutes);
app.use("/api/admin/trucks", truckRoutes);
app.use("/api/admin/truck-assignments", truckAssignRoutes);
app.use("/api/jobpods", jobPodRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/workdiaries", workDiaryRoutes);
app.use("/api/permanent-assign", permanentAssignRoutes);

// ✅ Serve frontend build for non-API routes
app.use(express.static(path.join(__dirname, "../frontend/dist"))); // Adjust path if needed

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// 404 handler (API only)
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Central error handler
app.use((err, req, res, next) => {
  logger.error("Error: %o", err);
  errorHandler(err, req, res, next);
});

// Start server after DB connection
const PORT = process.env.PORT || 3001;
let serverInstance;

connectDB()
  .then(() => {
    logger.info(`MongoDB connected`);
    logger.info(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
    serverInstance = app.listen(PORT);
  })
  .catch((err) => {
    logger.error("MongoDB connection failed: %o", err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGINT", () => {
  logger.info("SIGINT received, closing server...");
  if (serverInstance) {
    serverInstance.close(() => {
      logger.info("Server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
