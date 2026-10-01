const asyncHandler = require("../../../libs/asyncHandler");
const service = require("./FrmESevaLoanNAdvance.service");
const { ok, fail } = require("../../../libs/response");

const getLoanAdvanceList = asyncHandler(async (req, res) => {
  const { ulbId, empId, esevaEmpId } = req.body;

  const result = await service.getLoanAdvanceListService(ulbId, empId, esevaEmpId);

  return ok(res, result);
});

const insertLoanAndAdvance = asyncHandler(async (req, res) => {
  const data = await service.insertLoanAndAdvanceService(req.body);

  if (data.success) {
    return ok(res, data, data.errorMsg);
  }

  return fail(res, data.errorMsg, 400);
});

module.exports = {
  getLoanAdvanceList,
  insertLoanAndAdvance,
};
