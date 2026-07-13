const service = require("./FrmRelationListMst.service");
const asyncHandler = require("../../../libs/asyncHandler");

exports.getRelationList = asyncHandler(async (req, res) => {
  res.json(await service.getRelationListService());
});

exports.getRelationById = asyncHandler(async (req, res) => {
  res.json(await service.getRelationByIdService(req.body));
});

exports.saveRelation = asyncHandler(async (req, res) => {
  res.json(await service.saveRelationService(req.body));
});