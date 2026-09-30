const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");

const service = require("./FrmAttendenceEntryDMC.service");

exports.getAttendanceList = asyncHandler(async (req, res) => {
    const {
        ulbid,
        categoryId,
        zoneId,
        deptId,
        month,
        year,
    } = req.body;

    const data = await service.getAttendanceListService({
        ulbid,
        categoryId,
        zoneId,
        deptId,
        month,
        year,
    });

    return ok(
        res,
        data,
        "Attendance list fetched successfully"
    );
});


exports.saveAttendance = asyncHandler(
    async (req, res) => {
        const {
            userId,
            category,
            categoryId,
            zone,
            zoneId,
            department,
            departmentId,
            month,
            year,
            rows,
        } = req.body;

        const finalUserId =
            userId ||
            req.user?.userId ||
            req.user?.id;

        if (!finalUserId) {
            throw new AppError(
                "UserId is required",
                400
            );
        }

        const finalCategoryId =
            categoryId ?? category;

        const finalZoneId =
            zoneId ?? zone;

        const finalDepartmentId =
            departmentId ?? department;

        const data =
            await service.saveAttendanceService({
                userId: finalUserId,
                categoryId: finalCategoryId,
                zoneId: finalZoneId,
                departmentId: finalDepartmentId,
                month,
                year,
                rows,
            });

       if (!data.success) {
    return res.status(400).json({
        ok: false,
        message: data.message || "Attendance save failed",
        data
    });
}

        return ok(
            res,
            data,
            data.message ||
                "Attendance saved successfully"
        );
    }
);


exports.getYearList = asyncHandler(async (req, res) => {
    const data = await service.getYearListService();

    return ok(res, data, "Year list fetched successfully");
});