const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmAttendenceExcellAuthListMst.service");

const getAttendanceSummary = asyncHandler(async (req, res) => {
  const result = await service.getAttendanceSummaryService(req.body);
  return ok(res, result);
});

const getAttendanceDetail = asyncHandler(async (req, res) => {
  const result = await service.getAttendanceDetailService(req.body);
  return ok(res, result);
});

const manageAttendance = asyncHandler(async (req, res) => {
  const result = await service.manageAttendanceService(req.body);
  return ok(res, result);
});

module.exports = {
  getAttendanceSummary,
  getAttendanceDetail,
  manageAttendance,
};
