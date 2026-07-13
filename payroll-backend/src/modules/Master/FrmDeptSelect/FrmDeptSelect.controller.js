const service = require("./FrmDeptSelect.service");
const asyncHandler = require("../../../libs/asyncHandler");

exports.getDeptSelectList = asyncHandler(async (req, res) => {
  res.json(await service.getDeptSelectListService(req.body));
});

exports.getDepartmentOrder = asyncHandler(async (req, res) => {
  res.json(await service.getDepartmentOrderService(req.body));
});

exports.getDesignationList = asyncHandler(async (req, res) => {
  res.json(await service.getDesignationListService(req.body));
});

exports.getExistingDesignationOrder = asyncHandler(async (req, res) => {
  res.json(await service.getExistingDesignationOrderService(req.body));
});

exports.saveDepartmentOrder = asyncHandler(async (req, res) => {
  res.json(await service.saveDepartmentOrderService(req.body));
});