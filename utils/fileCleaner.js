const fs = require("fs");
const path = require("path");
const logger = require("./logger");

const deleteFile = (filePath) => {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      logger.warn(`File does not exist: ${fullPath}`);
      return;
    }
    fs.unlinkSync(fullPath);
    logger.info(`Deleted file: ${fullPath}`);
  } catch (error) {
    logger.error(`Failed to delete file ${filePath}: %o`, error);
  }
};

module.exports = deleteFile;
