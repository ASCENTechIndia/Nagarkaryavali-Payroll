const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const service = require("./FrmSalaryConsolidationRpt.service");

exports.getSalaryConsolidationReport = asyncHandler(async (req, res) => {

  const {
    ulbid,
    salaryDate,
    reportType,
    deptid,
  } = req.body;

  if (!ulbid) {
    throw new AppError("ulbid is required", 400);
  }

  if (!salaryDate) {
    throw new AppError("salaryDate is required", 400);
  }

  if (!reportType) {
    throw new AppError("reportType is required", 400);
  }

  if (!["D", "E"].includes(reportType)) {
    throw new AppError(
      "reportType must be either 'D' or 'E'",
      400
    );
  }

  const payload = {
    ulbid,
    salaryDate,
    reportType,
    deptid,
  };

  const data =
    await service.getSalaryConsolidationReportService(payload);

  return ok(
    res,
    data,
    data.count > 0
      ? "Salary consolidation report fetched successfully."
      : "No data found."
  );
});