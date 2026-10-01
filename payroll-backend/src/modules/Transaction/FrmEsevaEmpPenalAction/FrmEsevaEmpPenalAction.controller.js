const asyncHandler = require("../../../libs/asyncHandler");
const service = require("./FrmEsevaEmpPenalAction.service");
const { ok, fail } = require("../../../libs/response");

const getActionTypeList = asyncHandler(async (req, res) => {
  const result = await service.getActionTypeListService();

  return ok(res, result);
});

const getPensionImpactList = asyncHandler(async (req, res) => {
  const result = await service.getPensionImpactListService();

  return ok(res, result);
});

const getPenalActionDetails = asyncHandler(async (req, res) => {
  const { ulbId, empId, esevaEmpId } = req.body;

  const result = await service.getPenalActionDetailsService(ulbId, empId, esevaEmpId);

  return ok(res, result);
});

// Insert / Update Penal Action
const insertPenalAction = asyncHandler(async (req, res) => {
  const data = await service.insertPenalActionService(req.body);

  if (data.success) {
    return ok(res, data, data.errorMsg);
  }

  return fail(res, data.errorMsg, 400);
});

module.exports = {
  getActionTypeList,
  getPensionImpactList,
  getPenalActionDetails,
  insertPenalAction
};
