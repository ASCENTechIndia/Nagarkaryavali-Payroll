const asyncHandler = require("../../../libs/asyncHandler");
const service = require("./FrmESevaIncrAndPromotion.service");
const { ok, fail } = require("../../../libs/response");

const getIncrementList = asyncHandler(async (req, res) => {
  const { ulbId, empId, esevaEmpId } = req.body;

  const result = await service.getIncrementListService(ulbId, empId, esevaEmpId);

  return ok(res, result);
});

const getPromotionList = asyncHandler(async (req, res) => {
  const { ulbId, empId, esevaEmpId } = req.body;

  const result = await service.getPromotionListService(ulbId, empId, esevaEmpId);

  return ok(res, result);
});

const insertIncrementAndPromotion = asyncHandler(async (req, res) => {
  const data = await service.insertIncrementAndPromotionService(req.body);

  if (data.success) {
    return ok(res, data, data.errorMsg);
  }

  return fail(res, data.errorMsg, 400);
});

module.exports = {
  getIncrementList,
  getPromotionList,
  insertIncrementAndPromotion
};
