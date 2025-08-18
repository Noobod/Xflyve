const archiver = require("archiver");
const fs = require("fs");
const path = require("path");
const logger = require("./logger");

const generateZip = (filePaths, zipName = "download.zip", res) => {
  const archive = archiver("zip", { zlib: { level: 9 } });

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);

  archive.on("warning", (err) => {
    if (err.code === "ENOENT") {
      // Log warning but continue
      logger.warn("Archiver warning: %o", err);
    } else {
      // Treat other warnings as errors
      logger.error("Archiver warning treated as error: %o", err);
      res.status(500).json({ status: "error", message: "Failed to generate ZIP" });
      archive.abort();
    }
  });

  archive.on("error", (err) => {
    logger.error("Archiver error: %o", err);
    res.status(500).json({ status: "error", message: "Failed to generate ZIP" });
  });

  archive.on("end", () => {
    logger.info(`ZIP created with ${filePaths.length} files: ${zipName}`);
    res.end();
  });

  archive.pipe(res);

  filePaths.forEach((filePath) => {
    const absolutePath = path.resolve(filePath);
    const fileName = path.basename(absolutePath);
    if (fs.existsSync(absolutePath)) {
      archive.file(absolutePath, { name: fileName });
    } else {
      logger.warn(`File not found, skipping in zip: ${absolutePath}`);
    }
  });

  archive.finalize();
};

module.exports = generateZip;
