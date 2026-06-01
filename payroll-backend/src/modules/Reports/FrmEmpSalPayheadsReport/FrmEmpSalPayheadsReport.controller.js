const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmEmpSalPayheadsReport.service");

exports.getMonthList = asyncHandler(async (req, res) => {
  const data = await service.getMonthListService();
  return ok( res, data, data?.message ?? "Month list fetched successfully" );
});

exports.getYearList = asyncHandler(async (req, res) => {
  const data = await service.getYearListService();
  return ok( res, data, data?.message ?? "Year list fetched successfully" );
});

exports.getEmpSalPayheadsReport = asyncHandler(
  async (req, res) => {
    const { ulbid, salaryDate, deptId, reportType } = req.body;
    if (!ulbid) {
      throw new AppError("ulbid is required", 400);
    }
    if (!salaryDate) {
      throw new AppError("salaryDate is required",400);
    }
    if (!reportType) {
      throw new AppError("reportType is required",400);
    }

    const data = await service.getEmpSalPayheadsReportService({ ulbid, salaryDate, deptId, reportType});
    return ok( res, data, data?.message ?? "Report fetched successfully" );
  }
);