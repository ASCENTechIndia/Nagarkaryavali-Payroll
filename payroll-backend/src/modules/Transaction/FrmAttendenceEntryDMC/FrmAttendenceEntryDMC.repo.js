const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { executeProcedure } = require("../../../db/procedureExecutor");

async function getYearListRepo() {
    const sql = `
        SELECT
            var_year,
            num_year_id
        FROM aopr_year_mas
        ORDER BY num_year_id DESC
    `;

    const result = await executeQuery(sql);

    if (!result.success) {
        throw new Error(result.error);
    }

    return result.rows || [];
}

async function getAttendanceListRepo({
    ulbid,
    categoryId,
    zoneId,
    deptId,
    lstdate,
}) {
    let sql = `
        SELECT
            ED.num_employee_empid,
            ED.var_employee_engname AS EMPNAME,
            ED.num_employee_deptid,
            ED.num_employee_zone,
            0 AS monthattend_workingdays,
            NVL(m.leavebal, 0) AS monthattend_medicalleave,
            NVL(c.leavebal, 0) AS monthattend_earnedleave,
            NVL(h.leavebal, 0) AS monthattend_halfday,
            NVL(am.num_attendentry_lwpdays, 0) AS monthattend_withoutpay,
            am.var_attendentry_mlremrk AS monthattend_remark,
            am.num_attendentry_id AS attendentry_id
        FROM aopr_employee_def ED

        LEFT JOIN aoms_attendanceentry_mas am
            ON ED.num_employee_empid = am.num_attendentry_empid
            AND ED.num_employee_ulbid = am.num_attendentry_ulbid
            AND TRUNC(am.date_attendenrty_attendate) =
                TO_DATE(
                    :lstdate,
                    'DD-MON-YYYY',
                    'NLS_DATE_LANGUAGE=English'
                )

        LEFT JOIN vw_leavebal m
            ON m.num_leave_empid = ED.num_employee_empid
            AND m.var_leave_type = '1'
            AND TO_CHAR(am.date_attendenrty_attendate, 'MM') =
                TO_CHAR(m.date_leave_fromdate, 'MM')
            AND TO_CHAR(am.date_attendenrty_attendate, 'YYYY') =
                TO_CHAR(m.date_leave_fromdate, 'YYYY')
            AND m.var_leave_ishalfdayleave = 'N'

        LEFT JOIN vw_leavebal c
            ON c.num_leave_empid = ED.num_employee_empid
            AND c.var_leave_type = '2'
            AND TO_CHAR(am.date_attendenrty_attendate, 'MM') =
                TO_CHAR(c.date_leave_fromdate, 'MM')
            AND TO_CHAR(am.date_attendenrty_attendate, 'YYYY') =
                TO_CHAR(c.date_leave_fromdate, 'YYYY')
            AND c.var_leave_ishalfdayleave = 'N'

        LEFT JOIN vw_leavebal h
            ON h.num_leave_empid = ED.num_employee_empid
            AND h.var_leave_type = '2'
            AND TO_CHAR(am.date_attendenrty_attendate, 'MM') =
                TO_CHAR(h.date_leave_fromdate, 'MM')
            AND TO_CHAR(am.date_attendenrty_attendate, 'YYYY') =
                TO_CHAR(h.date_leave_fromdate, 'YYYY')
            AND h.var_leave_ishalfdayleave = 'Y'

        WHERE ED.num_employee_ulbid = :ulbid
    `;

    const binds = {
        ulbid: Number(ulbid),
        lstdate,
    };

    if (categoryId && String(categoryId) !== "0") {
        sql += `
            AND ED.num_employee_paysheettype = :categoryId
        `;
        binds.categoryId = Number(categoryId);
    }

    if (zoneId && String(zoneId) !== "0") {
        sql += `
            AND ED.num_employee_zone = :zoneId
        `;
        binds.zoneId = Number(zoneId);
    }

    if (deptId && String(deptId) !== "0") {
        sql += `
            AND ED.num_employee_deptid = :deptId
        `;
        binds.deptId = Number(deptId);
    }

    sql += `
        ORDER BY ED.num_employee_empid
    `;

    console.log("Attendance List Binds:", binds);

    const result = await executeQuery(sql, binds);

    if (!result.success) {
        console.error("Attendance List Query Error:", result.error);
        throw new Error(result.error);
    }

    return result.rows || [];
}

async function saveAttendanceRepo({
    userId,
    id,
    categoryId,
    zoneId,
    departmentId,
    month,
    year,
    attendanceString,
}) {
    const result = await executeProcedure({
        sql: `
            BEGIN
                aopr_bulkattendenceexcell_ins(
                    :in_userid,
                    :in_id,
                    :in_category,
                    :in_zone,
                    :in_department,
                    :in_month,
                    :in_year,
                    :in_str,
                    :in_str1,
                    :in_str2,
                    :in_str3,
                    :in_str4,
                    :in_str5,
                    :in_str6,
                    :in_str7,
                    :in_str8,
                    :in_str9,
                    :in_mode,
                    :out_errorcode,
                    :out_errormsg
                );
            END;
        `,
        binds: {
            in_userid: userId,
            in_id: Number(id || 0),
            in_category: Number(categoryId),
            in_zone: Number(zoneId),
            in_department: Number(departmentId),
            in_month: Number(month),
            in_year: Number(year),

            in_str: attendanceString,
            in_str1: null,
            in_str2: null,
            in_str3: null,
            in_str4: null,
            in_str5: null,
            in_str6: null,
            in_str7: null,
            in_str8: null,
            in_str9: null,

            in_mode: 1,

            out_errorcode: {
                dir: oracledb.BIND_OUT,
                type: oracledb.NUMBER,
            },
            out_errormsg: {
                dir: oracledb.BIND_OUT,
                type: oracledb.STRING,
                maxSize: 4000,
            },
        },
    });

    return result;
}

module.exports = {
    getYearListRepo,
    getAttendanceListRepo,
    saveAttendanceRepo,
};