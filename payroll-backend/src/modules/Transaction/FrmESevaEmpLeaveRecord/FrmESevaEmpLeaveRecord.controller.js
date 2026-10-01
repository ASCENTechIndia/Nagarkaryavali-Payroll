const asyncHandler = require("../../../libs/asyncHandler");
const service = require("./FrmESevaEmpLeaveRecord.service");
const { ok, fail } = require("../../../libs/response");

const getESevaEmpLeaveRecord = asyncHandler(async (req, res) => {
  const { ulbId, empId, esevaEmpId } = req.body;

  const result = await service.getESevaEmpLeaveRecordService(ulbId, empId, esevaEmpId);

  return ok(res, result);
});

const getLeaveTakenAndEarned = asyncHandler(async (req, res) => {
  const { ulbId, empId, esevaEmpId } = req.body;

  const result = await service.getLeaveTakenAndEarnedService(ulbId, empId, esevaEmpId);

  return ok(res, result);
});

const getLeaveDetails2 = asyncHandler(async (req, res) => {
  const { ulbId, empId, esevaEmpId } = req.body;

  const result = await service.getLeaveDetails2Service(ulbId, empId, esevaEmpId);

  return ok(res, result);
});
const getFinalLeaveDetails = asyncHandler(async (req, res) => {
  const { ulbId, empId, esevaEmpId } = req.body;

  const result = await service.getFinalLeaveDetailsService(ulbId, empId, esevaEmpId);

  return ok(res, result);
});

const getLeaveAvailability = asyncHandler(async (req, res) => {
  const { ulbId, empId, esevaEmpId } = req.body;

  const result = await service.getLeaveAvailabilityService(ulbId, empId, esevaEmpId);

  return ok(res, result);
});

const insertLeaveRecord = asyncHandler(async (req, res) => {
  const data = await service.insertLeaveRecordService(req.body);

  if (data.success) {
    return ok(res, data, data.errorMsg);
  }

  return fail(res, data.errorMsg, 400);
});

module.exports = {
  getESevaEmpLeaveRecord,
  getLeaveTakenAndEarned,
  getLeaveDetails2,
  getFinalLeaveDetails,
  getLeaveAvailability,
  insertLeaveRecord,
};
