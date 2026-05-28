const service = require("./FrmRelationListMst.service");
const asyncHandler = require("../../../libs/asyncHandler");

// ✅ Get Relation List
exports.getRelationList = asyncHandler(async (req, res) => {
  res.json(await service.getRelationListService());
});

// ✅ Get Relation Details By Id
exports.getRelationById = asyncHandler(async (req, res) => {
  res.json(await service.getRelationByIdService(req.body));
});

// ✅ Save / Update / Delete Relation
exports.saveRelation = asyncHandler(async (req, res) => {
  res.json(await service.saveRelationService(req.body));
});