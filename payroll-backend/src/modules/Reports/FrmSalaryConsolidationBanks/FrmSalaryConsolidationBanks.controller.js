const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const service = require("./FrmSalaryConsolidationBanks.service");

exports.getSalaryConsolidationBankReport = asyncHandler(
  async (req, res) => {
    console.log("📥 Request Body:", req.body);

    const { ulbid, fromDate, toDate, deptId, reportType } = req.body;
    if (!ulbid) {
      throw new AppError("ulbid is required", 400);
    }
    if (!fromDate) {
      throw new AppError("fromDate is required", 400);
    }
    if (!toDate) {
      throw new AppError("toDate is required", 400);
    }
    if (!reportType) {
      throw new AppError("reportType is required", 400);
    }

    const payload = { ulbid, fromDate, toDate, deptId, reportType };

    const data = await service.getSalaryConsolidationBankReportService(payload);
    return ok( res, data, data.message || "Salary consolidation report fetched successfully");
  }
);