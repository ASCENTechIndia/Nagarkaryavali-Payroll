const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmIncreamentPramotionMst.service");

exports.getEmployeeList = asyncHandler(async (req, res) => {
    console.log("📥 Request Body:", req.body);

    const { deptid, subdeptid, billno, ulbid } = req.body;
    if (!ulbid) {
        fail(res, error = "ulbid is required");
    }

    const payload = { deptid, subdeptid, billno, ulbid };
    const data = await service.getEmployeeListService(payload);
    return ok(res, data, data.message ?? "Employee list fetched successfully");
});

exports.getSubDepartmentList = asyncHandler(async (req, res) => {
    console.log("📥 Request Body:", req.body);

    const { deptid } = req.body;
    if (!deptid || deptid == null) {
        fail(res, error = "deptid is required");
    }

    const data = await service.getSubDepartmentListService({ deptid });
    return ok(res, data, data?.message ?? "Sub department list fetched successfully");
});

exports.getPromotionList = asyncHandler(async (req, res) => {
  const data = await service.getPromotionListService();
  return ok(res, data, data.message ?? "Promotion list fetched successfully");
});

exports.getIncrementTypeList = asyncHandler(async (req, res) => {
  const data = await service.getIncrementTypeListService();
  return ok(res, data, data.message ?? "Increment type list fetched successfully");
});

exports.getPayScaleList = asyncHandler(async (req, res) => {
  const data = await service.getPayScaleListService();

  return ok(res, data, data.message ?? "Pay scale list fetched successfully");
});

exports.getGradeList = asyncHandler(async (req, res) => {
  const data = await service.getGradeListService();

  return ok(res, data, data.message ?? "Grade list fetched successfully");
});

exports.getDesignationList = asyncHandler(async (req, res) => {
  const { ulbid } = req.body;

  if (!ulbid) {
     fail(res, error = "ulbid is required");
  }

  const data = await service.getDesignationListService({ulbid});
  return ok(res, data, data.message ?? "Designation list fetched successfully");
});

exports.getBillList = asyncHandler(async (req, res) => {
  const { ulbid, deptid } = req.body;

  if (!ulbid) {
    fail(res, error = "ulbid is required");
  }

  const data = await service.getBillListService({ulbid,deptid});
  return ok(res, data, data.message ?? "Bill list fetched successfully");
});

exports.saveIncrementPromotion = asyncHandler(async (req, res) => {
  console.log("📥 Request Body:", req.body);

  const data = await service.saveIncrementPromotionService(req.body);
  return ok(res, data, data.message ?? "Increment/Promotion saved successfully");
});

exports.updateDocument = asyncHandler(async (req, res) => {
  console.log("📥 BODY =>", req.body);
  console.log("📥 FILES =>", req.files);

  const { incPromoId, imageType } = req.body;
  if (!incPromoId) {
    fail(res, error = "incPromoId is required");
  }

  const payload = {incPromoId, imageType, BLOBDoc: req.files?.BLOBDoc?.[0]?.buffer || null};
  const data = await service.updateDocumentService(payload);
  return ok(res, data, data.message ?? "Document uploaded successfully");
});