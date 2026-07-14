const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmEmployeeRetire.service");

exports.getRetirementReasons = asyncHandler(async (req, res) => {
    const data = await service.getRetirementReasonService();
    return ok(res, data, "Retirement reasons fetched successfully");
});

exports.getDepartments = asyncHandler(async (req, res) => {
    const { ulbid } = req.body;
    
    if (!ulbid) {
        return fail(res, "ulbid is required", 400);
    }
    
    const data = await service.getDepartmentService({ ulbid });
    return ok(res, data, "Departments fetched successfully");
});

exports.getSubDepartments = asyncHandler(async (req, res) => {
    const { ulbid, deptId } = req.body;
    
    if (!ulbid) {
        return fail(res, "ulbid is required", 400);
    }
    if (!deptId || deptId === "0") {
        return fail(res, "Department ID is required", 400);
    }
    
    const data = await service.getSubDepartmentService({ ulbid, deptId });
    return ok(res, data, "Sub-departments fetched successfully");
});

exports.getEmployees = asyncHandler(async (req, res) => {
    const { ulbid, deptId, subDeptId } = req.body;
    
    if (!ulbid) {
        return fail(res, "ulbid is required", 400);
    }
    
    const data = await service.getEmployeeListService({ ulbid, deptId, subDeptId });
    return ok(res, data, "Employees fetched successfully");
});

exports.saveRetirement = asyncHandler(async (req, res) => {
    const {
        userId,
        empId,
        deptId,
        subDeptId,
        reasonId,
        othReason,
        retireDate,
        ulbid,
        remark
    } = req.body;
    
    let blobData = null;
    if (req.file) {
        blobData = req.file.buffer;
    }
    
    const data = await service.saveRetirementService({
        userId,
        empId,
        deptId,
        subDeptId,
        reasonId,
        othReason,
        retireDate,
        ulbid,
        remark,
        blobData
    });
    
    if (data.success) {
        return ok(res, data, data.message);
    } else {
        return fail(res, data.message, 400);
    }
});
