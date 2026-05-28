const service = require("./FrmPayHeadListMst.service");
const asyncHandler = require("../../../libs/asyncHandler");

// ✅ Get PayHeads List
exports.getPayHeadsList = asyncHandler(async (req, res) => {
  res.json(await service.getPayHeadsListService(req.body));
});

exports.getPaySubHeadsList = asyncHandler(async (req, res) => {
  res.json(await service.getPaySubHeadsListService());
});

// ✅ Get Parent PayHeads List
exports.getParentPayHeadsList = asyncHandler(async (req, res) => {
  res.json(await service.getParentPayHeadsListService(req.body));
});

// ✅ Get PayHead Details By Id
exports.getPayHeadDetailsById = asyncHandler(async (req, res) => {
  res.json(await service.getPayHeadDetailsByIdService(req.body));
});

exports.savePayHead = asyncHandler(async (req, res) => {
  res.json(await service.savePayHeadService(req.body));
});
