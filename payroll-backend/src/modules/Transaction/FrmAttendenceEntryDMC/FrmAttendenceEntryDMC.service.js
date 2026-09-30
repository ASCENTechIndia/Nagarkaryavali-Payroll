const repo = require("./FrmAttendenceEntryDMC.repo");
const { AppError } = require("../../../libs/errors");

function getLastDateOfMonth(year, month) {
    const date = new Date(
        Number(year),
        Number(month),
        0
    );

    const day = String(date.getDate()).padStart(2, "0");

    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    return `${day}-${monthNames[Number(month) - 1]}-${year}`;
}

function validateNumber(value, fieldName) {
    if (
        value === undefined ||
        value === null ||
        value === "" ||
        Number.isNaN(Number(value))
    ) {
        throw new AppError(`${fieldName} is required`, 400);
    }
}

async function getAttendanceListService({
    ulbid,
    categoryId,
    zoneId,
    deptId,
    month,
    year,
}) {
    validateNumber(ulbid, "ulbid");
    validateNumber(month, "month");
    validateNumber(year, "year");

    const lstdate = getLastDateOfMonth(year, month);

    const data = await repo.getAttendanceListRepo({
        ulbid: Number(ulbid),
        categoryId:
            categoryId === undefined ||
            categoryId === null ||
            categoryId === ""
                ? "0"
                : categoryId,
        zoneId:
            zoneId === undefined ||
            zoneId === null ||
            zoneId === ""
                ? "0"
                : zoneId,
        deptId:
            deptId === undefined ||
            deptId === null ||
            deptId === ""
                ? "0"
                : deptId,
        lstdate,
    });

    return {
        success: true,
        count: data.length,
        data,
    };
}

async function saveAttendanceService({
    userId,
    categoryId,
    zoneId,
    departmentId,
    month,
    year,
    rows,
}) {
    if (!userId) {
        throw new AppError("UserId is required", 400);
    }

    validateNumber(categoryId, "categoryId");
    validateNumber(zoneId, "zoneId");
    validateNumber(departmentId, "departmentId");
    validateNumber(month, "month");
    validateNumber(year, "year");

    if (!Array.isArray(rows) || rows.length === 0) {
        throw new AppError(
            "Please select atleast one record to proceed",
            400
        );
    }

    const attendanceDate = getLastDateOfMonth(
        year,
        month
    );

    const attendanceRows = [];

    for (const row of rows) {
        const empId =
            row.Emp_Id ??
            row.empId ??
            row.NUM_EMPLOYEE_EMPID;

        const empName =
            row.Name ??
            row.empName ??
            row.EMPNAME ??
            "";

        const biometric =
            row["Bio-Metric"] ??
            row.biometric ??
            row.BIOMETRIC ??
            0;

        const attendance =
            row.Attendance ??
            row.attendance ??
            row.MONTHATTEND_WORKINGDAYS ??
            "";

        const medicalLeave =
            row.Medical_Leave ??
            row.medicalLeave ??
            row.MONTHATTEND_MEDICALLEAVE ??
            0;

        const earnedLeave =
            row.Earned_Leave ??
            row.earnedLeave ??
            row.MONTHATTEND_EARNEDLEAVE ??
            0;

        const hp =
            row.HP ??
            row.hp ??
            row.MONTHATTEND_HALFDAY ??
            0;

        const lwp =
            row.LWP ??
            row.lwp ??
            row.MONTHATTEND_WITHOUTPAY ??
            0;

        const present =
            row.Present ??
            row.present ??
            "";

        const remark =
            row.Remark ??
            row.remark ??
            row.MONTHATTEND_REMARK ??
            "";

        if (
            String(attendance).trim() === "" ||
            String(present).trim() === ""
        ) {
            continue;
        }

        attendanceRows.push(
            [
                empId,
                empName,
                biometric,
                attendance,
                present,
                medicalLeave,
                earnedLeave,
                hp,
                lwp,
                remark,
                attendanceDate,
            ].join("$")
        );
    }

    if (attendanceRows.length === 0) {
        throw new AppError(
            "Please select atleast one record to proceed",
            400
        );
    }

    const attendanceString = attendanceRows.join("#");

    const result = await repo.saveAttendanceRepo({
    userId,
    id: 0,
    categoryId,
    zoneId,
    departmentId,
    month,
    year,
    attendanceString,
});

console.log("Attendance Procedure Result:", result);

const errorCode =
    result?.outBinds?.out_errorcode ??
    result?.outBinds?.out_ErrorCode;

const errorMessage =
    result?.outBinds?.out_errormsg ??
    result?.outBinds?.out_ErrorMsg;

console.log("Attendance Error Code:", errorCode);
console.log("Attendance Error Message:", errorMessage);

return {
    success: Number(errorCode) === 9999,
    errorCode,
    message: errorMessage,
    count: attendanceRows.length,
};
}

async function getYearListService() {
    const data = await repo.getYearListRepo();

    return {
        success: true,
        count: data.length,
        data,
    };
}

module.exports = {
    getAttendanceListService,
    saveAttendanceService,
    getYearListService
};