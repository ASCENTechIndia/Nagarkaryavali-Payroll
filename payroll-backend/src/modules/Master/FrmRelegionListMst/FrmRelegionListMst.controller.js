const service = require("./FrmRelegionListMst.service");
const asyncHandler = require("../../../libs/asyncHandler");

// ✅ Get Religion List
exports.getReligionList = asyncHandler(async (req, res) => {
  res.json(await service.getReligionListService());
});

// ✅ Get Religion Details By Id
exports.getReligionDetailsById = asyncHandler(async (req, res) => {
  res.json(await service.getReligionDetailsByIdService(req.body));
});

// ✅ Save / Update / Delete Religion
exports.saveReligion = asyncHandler(async (req, res) => {
  res.json(await service.saveReligionService(req.body));
});
