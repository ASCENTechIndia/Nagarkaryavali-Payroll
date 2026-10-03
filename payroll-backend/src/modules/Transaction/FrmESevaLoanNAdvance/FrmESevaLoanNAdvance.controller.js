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

const updateLoanAdvanceSignature = asyncHandler(async (req, res) => {
  const { empId, ulbId, esevaEmpId } = req.body;
  console.log({req:req.body, file:req.file});
  if (!req.file) {
    return fail(res, "Signature image is required", 400);
  }

  const result = await service.updateLoanAdvanceSignatureService(req.file.buffer, empId, ulbId, esevaEmpId);

  return ok(res, result, "Signature updated successfully");
});

module.exports = {
  getLoanAdvanceList,
  insertLoanAndAdvance,
  updateLoanAdvanceSignature
};
