const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const service = require("./FrmEsevaReport.service");
const { EsevaReportPDFHelper } = require("../../../utils/pdfHelper/FrmEsevaReport");
const path = require("path");

exports.searchEmployee = asyncHandler(async (req, res) => {
  const { ulbId, empCode } = req.body;

  if (!ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  if (!empCode || empCode.trim() === "") {
    throw new AppError("Employee code is required", 400);
  }

  const data = await service.searchEmployeeService({
    ulbId,
    empCode: empCode.trim()
  });

  return ok(res, data, "Employee data fetched successfully");
});

exports.generateEsevaReport = asyncHandler(async (req, res) => {
  const { ulbId, empCode } = req.body;

  if (!ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  if (!empCode || empCode.trim() === "") {
    throw new AppError("Employee code is required", 400);
  }

  // Get all employee report data
  const reportData = await service.getCompleteEsevaReportService({
    ulbId,
    empCode: empCode.trim(),
    userId: req.user.userId,
    userName: req.user.userName || req.user.name,
    corporationName: req.user.corporationName || "Municipal Corporation"
  });

  if (!reportData || !reportData.personalInfo || reportData.personalInfo.length === 0) {
    throw new AppError("No records found for the given employee code", 404);
  }

  // Generate PDF
  const pdf = await EsevaReportPDFHelper({
    reportData,
    ulbId,
    userId: req.user.userId,
    userName: req.user.userName || req.user.name,
    corporationName: req.user.corporationName || "Municipal Corporation"
  });

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const pdfUrl = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

  return res.json({
    success: true,
    message: "PDF Generated Successfully",
    fileName: pdf.fileName,
    pdfUrl,
    employeeDetails: reportData.personalInfo[0]
  });
});