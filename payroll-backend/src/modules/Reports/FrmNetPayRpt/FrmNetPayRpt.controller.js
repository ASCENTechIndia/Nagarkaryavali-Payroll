const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmNetPayRpt.service");
const { AppError } = require("../../../libs/errors");

exports.generateNetPayReport = asyncHandler(async (req, res) => {
  console.log("Request: Generate Net Pay Report");
  console.log("Request Body:", req.body);

  const {
    ulbId,
    departmentId,
    month,
    year,
    corporationName,
    brNameMar,
    brAddMar,
    userId,
    chalanOfficeName
  } = req.body;

  // Validation
  if (!ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  if (!departmentId || departmentId === "0") {
    throw new AppError("Please select Department", 400);
  }

  if (!month) {
    throw new AppError("Month is required", 400);
  }

  if (!year) {
    throw new AppError("Year is required", 400);
  }

  const payload = {
    ulbId,
    departmentId,
    month,
    year,
    corporationName,
    brNameMar,
    brAddMar,
    userId,
    chalanOfficeName
  };

  const data = await service.generateNetPayReportService(payload);

  return ok(res, data, "Net pay report generated successfully");
});

exports.generateVacantPostsReport = asyncHandler(async (req, res) => {
  console.log("Request: Generate Vacant Posts Report");
  console.log("Request Body:", req.body);
  const {
    ulbId,
    departmentId,
    month,
    year,
    corporationName,
    brNameMar,
    brAddMar,
    userId,
    chalanOfficeName
  } = req.body;

  // Validation
  if (!ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  if (!departmentId || departmentId === "0") {
    throw new AppError("Please select Department", 400);
  }

  if (!month) {
    throw new AppError("Month is required", 400);
  }

  const payload = {
    ulbId,
    departmentId,
    month,
    year,
    corporationName,
    brNameMar,
    brAddMar,
    userId,
    chalanOfficeName
  };

  const data = await service.generateVacantPostsReportService(payload);

  return ok(res, data, "Vacant posts report generated successfully");
});