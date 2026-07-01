const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmLoansAndAdvancesRpt.service");
const { AppError } = require("../../../libs/errors");

exports.getCategoryList = asyncHandler(async (req, res) => {
  console.log("📥 Request: Get Category List");
  const { ulbid } = req.query;

  const data = await service.getCategoryListService({ ulbid });

  return ok(res, data, "Category list fetched successfully");
});

exports.getZoneList = asyncHandler(async (req, res) => {
  console.log("📥 Request Body:", req.body);

  const { ulbid } = req.body;

  if (!ulbid) {
    throw new AppError("ulbid is required", 400);
  }

  const payload = { ulbid };
  const data = await service.getZoneListService(payload);

  return ok(res, data, "Zone list fetched successfully");
});

exports.getDepartmentList = asyncHandler(async (req, res) => {
  console.log("📥 Request Body:", req.body);

  const { ulbid } = req.body;

  if (!ulbid) {
    throw new AppError("ulbid is required", 400);
  }

  const payload = { ulbid };
  const data = await service.getDepartmentListService(payload);

  return ok(res, data, "Department list fetched successfully");
});

exports.getEmployeeList = asyncHandler(async (req, res) => {
  console.log("📥 Request Body:", req.body);

  const { ulbid, deptId } = req.body;

  if (!ulbid) {
    throw new AppError("ulbid is required", 400);
  }

  const payload = { ulbid, deptId };
  const data = await service.getEmployeeListService(payload);

  return ok(res, data, "Employee list fetched successfully");
});

exports.searchLoansAdvances = asyncHandler(async (req, res) => {
  console.log("📥 Request Body:", req.body);

  const {
    ulbid,
    categoryId,
    zoneId,
    deptId,
    employeeId
  } = req.body;

  if (!ulbid) {
    throw new AppError("ulbid is required", 400);
  }

  const payload = {
    ulbid,
    categoryId,
    zoneId,
    deptId,
    employeeId
  };

  const data = await service.searchLoansAdvancesService(payload);

  return ok(res, data, "Loans and advances fetched successfully");
});