const service = require("./FrmPayCommissionListMst.service");
const asyncHandler = require("../../../libs/asyncHandler");

// ✅ Get Pay Commission List
exports.getPayCommissionList = asyncHandler(async (req, res) => {
  res.json(await service.getPayCommissionListService());
});

// ✅ Get Pay Commission Details By Id
exports.getPayCommissionById = asyncHandler(async (req, res) => {
  res.json(await service.getPayCommissionByIdService(req.body));
});
// ✅ Save / Update Pay Commission
exports.savePayCommission = asyncHandler(async (req, res) => {
  res.json(await service.savePayCommissionService(req.body));
});