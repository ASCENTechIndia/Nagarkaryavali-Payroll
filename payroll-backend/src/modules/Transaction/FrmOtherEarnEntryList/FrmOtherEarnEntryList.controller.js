const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmOtherEarnEntryList.service");

exports.getEarningHeadList = asyncHandler(async (req, res) => {
    const { ulbid } = req.body;
    
    const data = await service.getEarningHeadListService({ ulbid });
    return ok(res, data, "Earning head list fetched successfully");
});

exports.getEmployeeList = asyncHandler(async (req, res) => {
    const { ulbid, deptId, desgnId } = req.body;
    
    const data = await service.getEmployeeListService({ ulbid, deptId, desgnId });
    return ok(res, data, "Employee list fetched successfully");
});

exports.getEmployeeDetails = asyncHandler(async (req, res) => {
    const { ulbid, empId } = req.body;
    
    const data = await service.getEmployeeDetailsService({ ulbid, empId });
    return ok(res, data, "Employee details fetched successfully");
});

exports.getOtherEarningList = asyncHandler(async (req, res) => {
    const data = await service.getOtherEarningListService();

    return ok(res, data, "Other earning list fetched successfully");
});

exports.getEditRecord = asyncHandler(async (req, res) => {
    const { ulbid, empId, detId } = req.body;
    
    const data = await service.getEditRecordService({ ulbid, empId, detId });
    return ok(res, data, "Record details fetched successfully");
});

exports.saveOtherEarning = asyncHandler(async (req, res) => {
    const {
        userId,
        empId,
        earnId,
        payheadId,
        amount,
        ulbid,
        deptId,
        desigId,
        amtDate,
        remark,
        mode
    } = req.body;
    
    const data = await service.saveOtherEarningService({
        userId,
        empId,
        earnId,
        payheadId,
        amount,
        ulbid,
        deptId,
        desigId,
        amtDate,
        remark,
        mode
    });
    
    if (data.success) {
        return ok(res, data, data.message);
    } else {
        return fail(res, data.message, 400);
    }
});
