const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const service = require("./FrmEsevaReport.service");
const {
  EsevaReportPDFHelper,
} = require("../../../utils/pdfHelper/FrmEsevaReport");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env")
});

exports.searchEmployee = asyncHandler(async (req, res) => {
  const { ulbId, empCode } = req.body;

  if (!ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  if (!empCode || String(empCode).trim() === "") {
    throw new AppError("Employee code is required", 400);
  }

  const data = await service.searchEmployeeService({
    ulbId,
    empCode: String(empCode).trim(),
  });

  return ok(res, data, "Employee data fetched successfully");
});

exports.generateEsevaReport = asyncHandler(async (req, res) => {
  const {
    ulbId,
    empCode,
    corporationName,
    brNameMar,
    brAddMar,
    userId,
    userName,
  } = req.body;

  if (!ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  if (!empCode || String(empCode).trim() === "") {
    throw new AppError("Employee code is required", 400);
  }

  const reportData = await service.getCompleteEsevaReportService({
    ulbId,
    empCode: String(empCode).trim(),
    corporationName: corporationName || "",
    brNameMar: brNameMar || "",
    brAddMar: brAddMar || "",
    userId: userId || req.user?.userId || "",
    userName: userName || req.user?.userName || req.user?.name || "",
  });

  if (!reportData || !reportData.personalInfo) {
    throw new AppError("Employee record not found", 404);
  }

  const pdf = await EsevaReportPDFHelper({
    reportData,
    corporationName: corporationName || "Municipal Corporation",
    brNameMar: brNameMar || "",
    brAddMar: brAddMar || "",
    userId: userId || req.user?.userId || "",
    userName: userName || req.user?.userName || req.user?.name || "",
  });

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const pdfUrl = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

  return res.status(200).json({
    success: true,
    message: "E-Seva report generated successfully",
    fileName: pdf.fileName,
    pdfUrl,
    employeeDetails: reportData.personalInfo,
  });
});
