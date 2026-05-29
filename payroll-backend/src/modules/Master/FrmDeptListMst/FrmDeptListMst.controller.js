const service = require("./FrmDeptListMst.service");
const asyncHandler = require("../../../libs/asyncHandler");

exports.getDepartmentList = asyncHandler(async (req, res) => {
  res.json(await service.getDepartmentListService());
});

exports.searchDepartmentList = asyncHandler(async (req, res) => {
  res.json(await service.searchDepartmentListService(req.body));
});

exports.getDepartmentDetailsById = asyncHandler(async (req, res) => {
  res.json(await service.getDepartmentDetailsByIdService(req.body));
});

exports.saveDepartment = asyncHandler(async (req, res) => {
  res.json(await service.saveDepartmentService(req.body));
});
