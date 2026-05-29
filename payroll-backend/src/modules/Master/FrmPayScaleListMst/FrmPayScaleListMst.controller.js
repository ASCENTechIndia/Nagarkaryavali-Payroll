const service = require("./FrmPayScaleListMst.service");
const asyncHandler = require("../../../libs/asyncHandler");

// ✅ Get PayScale List
exports.getPayScaleList = asyncHandler(async (req, res) => {
  res.json(await service.getPayScaleListService(req.body));
});

// ✅ Get PayScale By Id
exports.getPayScaleById = asyncHandler(async (req, res) => {
  res.json(await service.getPayScaleByIdService(req.body));
});

// ✅ Save / Update / Delete PayScale
exports.savePayScale = asyncHandler(async (req, res) => {
  res.json(await service.savePayScaleService(req.body));
});