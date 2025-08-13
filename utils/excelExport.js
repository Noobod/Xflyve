const ExcelJS = require("exceljs");
const logger = require("./logger");

/**
 * Exports data to Excel file and sends it as response
 * @param {Array<Object>} dataArray
 * @param {Array<{label: string, key: string, width?: number}>} headers
 * @param {string} [fileName="export"]
 * @param {import('express').Response} res
 */
async function exportToExcel(dataArray, headers, fileName = "export", res) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Export");

    worksheet.columns = headers.map((h) => ({
      header: h.label,
      key: h.key,
      width: h.width || 20,
    }));

    worksheet.addRows(dataArray);

    // Enable autofilter on header row
    worksheet.autoFilter = {
      from: "A1",
      to: worksheet.getRow(1).lastCell.address,
    };

    res.status(200);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    logger.error("Excel export failed: %o", err);
    res.status(500).json({ status: "error", message: "Excel export failed" });
  }
}

module.exports = exportToExcel;
