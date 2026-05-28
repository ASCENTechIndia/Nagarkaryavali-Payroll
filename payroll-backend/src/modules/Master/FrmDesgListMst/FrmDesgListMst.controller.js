const service = require("./FrmDesgListMst.service");
const asyncHandler = require("../../../libs/asyncHandler");

// ✅ Get Designation List
exports.getDesignationList = asyncHandler(async (req, res) => {
  res.json(await service.getDesignationListService());
});

// ✅ Search Designation List
exports.searchDesignationList = asyncHandler(async (req, res) => {
  res.json(await service.searchDesignationListService(req.body));
});

// ✅ Get Designation Details By Id
exports.getDesignationDetailsById = asyncHandler(async (req, res) => {
  res.json(await service.getDesignationDetailsByIdService(req.body));
});

exports.saveDesignation = asyncHandler(async (req, res) => {
  res.json(await service.saveDesignationService(req.body));
});
