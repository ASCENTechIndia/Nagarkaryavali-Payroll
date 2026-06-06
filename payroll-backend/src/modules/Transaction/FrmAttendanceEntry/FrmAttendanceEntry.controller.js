const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmAttendanceEntry.service");

exports.getAttendanceList = asyncHandler(async (req, res) => {
    const {
        categoryId,
        zoneId,
        deptId,
        subdeptId,
        billNo,
        empId,
        ulbid,
        month,
        year
    } = req.body;

    console.log("Controller Data: ", req.body);
    
    const data = await service.getAttendanceListService({
        categoryId,
        zoneId,
        deptId,
        subdeptId,
        billNo,
        empId,
        ulbid,
        month,
        year
    });
    
    return ok(res, data, "Attendance list fetched successfully");
});

exports.saveAttendance = asyncHandler(async (req, res) => {
    const {
        userId,
        categoryId,
        zoneId,
        departmentId,
        subdepartmentId,
        month,
        year,
        attendanceStr,
        ulbId
    } = req.body;
    
    const data = await service.saveAttendanceService({
        userId,
        categoryId,
        zoneId,
        departmentId,
        subdepartmentId,
        month,
        year,
        attendanceStr,
        ulbId
    });
    
    if (data.success) {
        return ok(res, data, data.message);
    } else {
        return fail(res, data.message, 400);
    }
});