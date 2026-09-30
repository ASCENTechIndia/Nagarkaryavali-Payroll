const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmEsevaEmpList.service");

exports.getEmployeeStage = asyncHandler(async (req, res) => {
    const { empid, ulbid } = req.query;

    if (!empid) return fail(res, "empid is required", 400);
    if (!ulbid) return fail(res, "ulbid is required", 400);

    const data = await service.getEmployeeStageService({ empid, ulbid });
    return ok(res, data, "Employee stage fetched successfully");
});

exports.getEmployeeList = asyncHandler(async (req, res) => {
    const { ulbid, deptid, empid, empname, deptslipSequence } = req.query;

    if (!ulbid) return fail(res, "ulbid is required", 400);

    const data = await service.getEmployeeListService({ ulbid, deptid, empid, empname, deptslipSequence });
    return ok(res, data, "Employee list fetched successfully");
});