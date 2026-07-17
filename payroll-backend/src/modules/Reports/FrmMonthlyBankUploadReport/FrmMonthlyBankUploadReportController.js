const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");

const service = require("./FrmMonthlyBankUploadReportService");

exports.generateMonthlyBankUploadReport = asyncHandler(async (req, res) => {
  console.log("Request: Generate Monthly Bank Upload Report");
  console.log("Request Body:", req.body);

  const {
    ulbId,
    departmentId,
    month,
    year,
  } = req.body;

  // Validation
  if (!ulbId) {
    throw new AppError("ulbId is required", 400);
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
  };

  const data = await service.generateMonthlyBankUploadReportService(payload);

  return ok(
    res,
    data,
    "Monthly Bank Upload Report fetched successfully"
  );
});