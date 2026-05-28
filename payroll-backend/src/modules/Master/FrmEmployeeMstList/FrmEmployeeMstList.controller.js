const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmEmployeeMstList.service");
const { AppError } = require("../../../libs/errors");

exports.getEmployeeCategory = asyncHandler(async (req, res) => {
  console.log("📥 Request: Get Employee Categories");

  const data = await service.getEmployeeCategoryService();

  return ok( res, data);
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

exports.getSubDepartmentList = asyncHandler(async (req, res) => {
  console.log("📥 Request Body:", req.body);

  const { deptId, ulbid } = req.body;

  if (!deptId) {
    throw new AppError("deptId is required", 400);
  }

  if (!ulbid) {
    throw new AppError("ulbid is required", 400);
  }

  const payload = {
    deptId,
    ulbid,
  };

  const data = await service.getSubDepartmentListService(payload);

  return ok(
    res,
    data,
    "Sub department list fetched successfully"
  );
});

exports.searchEmployee = asyncHandler(async (req, res) => {
  console.log("📥 Request Body:", req.body);

  const {
    ulbid,
    paysheetType,//Category
    zoneId,
    deptId,
    subDeptId,
    employeeCode,
    employeeName,
  } = req.body;

  if (!ulbid) {
    throw new AppError("ulbid is required", 400);
  }

  const payload = {
    ulbid,
    paysheetType,
    zoneId,
    deptId,
    subDeptId,
    employeeCode,
    employeeName,
  };

  const data = await service.searchEmployeeService(payload);

  return ok(
    res,
    data,
    "Employee search fetched successfully"
  );
});