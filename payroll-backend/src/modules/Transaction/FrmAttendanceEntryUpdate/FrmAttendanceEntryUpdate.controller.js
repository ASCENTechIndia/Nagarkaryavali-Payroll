const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmAttendanceEntryUpdate.service");

exports.getAttendanceEntryUpdate = asyncHandler(async (req, res) => {
    console.log("📥 Request Body:", req.body);

    const { ulbid, salaryDate, attendDate, deptid, subdeptid, billNo, paysheettype, zone, empid, oldempno } = req.body;

    if (!ulbid) {
        fail(res, error = "ulbid is required");
    }
    if (!salaryDate) {
        fail(res, error = "salaryDate is required");
    }
    if (!attendDate) {
        fail(res, error = "attendDate is required");
    }
    if (!deptid) {
        fail(res, error = "deptid is required");
    }
    if (!zone) {
        fail(res, error = "zone is required");
    }

    const payload = { ulbid, salaryDate, attendDate, deptid, subdeptid, billNo, paysheettype, zone, empid, oldempno };
    const data = await service.getAttendanceEntryUpdateService(payload);

    return ok(res, data, data.message || "Attendance entry fetched successfully");
});

exports.saveBulkAttendance = asyncHandler(async (req, res) => {
    console.log("📥 Request Body:", req.body);

    const { userId, id, category, zone, department, month, year, str, subdepartment } = req.body;

    if (!userId) {
        fail(res, error = "userId is required")
    }
    if (!department) {
        fail(res, error = "department is required")
    }
    if (!month) {
        fail(res, error = "month is required")
    }
    if (!year) {
        fail(res, error = "year is required")
    }
    if (!str || str.trim() === "") {
        fail(res, error = "str is required")
    }

    const payload = {userId, id, category, zone, department, month, year, str, subdepartment};

    const data = await service.saveBulkAttendanceService(payload);
    return ok(res, data, data.message || "Bulk Attendance Updated Successfully");
});