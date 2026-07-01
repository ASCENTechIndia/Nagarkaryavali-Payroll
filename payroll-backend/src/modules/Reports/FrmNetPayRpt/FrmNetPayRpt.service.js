const repo = require("./FrmNetPayRpt.repo");
const { NetPayReportHelper, VacantPostsReportHelper } = require("../../../utils/pdfHelper/FrmNetPayRpt");
const path = require("path");
const fs = require("fs");

async function generateNetPayReportService(payload) {
  console.log("Service: Generate Net Pay Report", payload);

  const { 
    ulbId, 
    departmentId, 
    month, 
    year, 
    corporationName, 
    brNameMar, 
    brAddMar, 
    userId,
    chalanOfficeName,
    ulbLogo
  } = payload;

  // Calculate last date of the month
  const lastDate = new Date(parseInt(year), parseInt(month), 0);
  const formattedLastDate = formatDate(lastDate);

  const netPayData = await repo.getNetPayDataRepo({
    ulbId,
    departmentId,
    lastDate: formattedLastDate
  });

  if (!netPayData || netPayData.length === 0) {
    throw new Error("Record Not Found");
  }

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const monthName = monthNames[parseInt(month) - 1];

  const ulbInfo = {
    ABC_MUNICIPAL_TEXT: corporationName || brNameMar,
    ULBLOGO: ulbLogo || "",
    corporationName: corporationName || brNameMar
  };

  const filters = {
    month: monthName,
    year: year,
    brNameMar: brNameMar,
    userId: userId,
    departmentId: departmentId
  };

  const result = await NetPayReportHelper({
    rows: netPayData,
    reportName: "Net Pay Details",
    ulbInfo: ulbInfo,
    filters: filters
  });

  return {
    success: true,
    pdfPath: result.relativePath,
    pdfFileName: result.fileName,
    recordCount: netPayData.length,
    message: "Report generated successfully"
  };
}

async function generateVacantPostsReportService(payload) {
  console.log("Service: Generate Vacant Posts Report", payload);

  const { 
    ulbId, 
    departmentId, 
    month, 
    year, 
    corporationName, 
    brNameMar, 
    brAddMar, 
    userId,
    chalanOfficeName,
    ulbLogo
  } = payload;

  // Calculate last date of the month
  const lastDate = new Date(parseInt(year), parseInt(month), 0);
  const formattedLastDate = formatDate(lastDate);

  const vacantPostsData = await repo.getVacantPostsDataRepo({
    ulbId,
    departmentId,
    lastDate: formattedLastDate
  });
console.log("vacantPostsData:", vacantPostsData);
  if (!vacantPostsData || vacantPostsData.length === 0) {
    throw new Error("Record Not Found");
  }

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const monthName = monthNames[parseInt(month) - 1];

  const ulbInfo = {
    ABC_MUNICIPAL_TEXT: corporationName || brNameMar,
    ULBLOGO: ulbLogo || "",
    corporationName: corporationName || brNameMar
  };

  const filters = {
    month: monthName,
    year: year,
    userId: userId,
    departmentId: departmentId
  };

  const result = await VacantPostsReportHelper({
    rows: vacantPostsData,
    reportName: "रिक्तपद अहवाल",
    ulbInfo: ulbInfo,
    filters: filters
  });

  return {
    success: true,
    pdfPath: result.relativePath,
    pdfFileName: result.fileName,
    recordCount: vacantPostsData.length,
    message: "Report generated successfully"
  };
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

module.exports = {
  generateNetPayReportService,
  generateVacantPostsReportService
};