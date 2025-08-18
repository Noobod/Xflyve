const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Multer storage config for POD uploads.
 * Automatically creates the uploads/pods folder if missing.
 * Filenames are unique with timestamp + random suffix.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/pods");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `pod-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

/**
 * File filter to accept only PDF files for POD uploads.
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const uploadPodMiddleware = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = uploadPodMiddleware;
