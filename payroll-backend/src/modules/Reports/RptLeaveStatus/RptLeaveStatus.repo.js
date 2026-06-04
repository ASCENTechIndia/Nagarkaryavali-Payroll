const { executeQuery } = require("../../../db/queryExecutor")

const leaveTypeRepo = async() => {
    console.log("Repo: Leave Status Dropdown")
    const sql = `
    select var_leavetype_name, num_leavetype_id from AOPR_LEAVETYPE_MST order by var_leavetype_name
    `
    const result = await executeQuery(sql)

    if(!result){
        throw new Error(result.error)
    }
    return result.rows
}

const getLeaveReportRepo = async({ ulbid, fromMonth, leaveTypeId, empid}) => {
    console.log("📤 Repo: Leave Report", { ulbid, fromMonth, leaveTypeId, empid});
    const binds = {  fromMonth };
    const conditions = [ "var_leave_frommonth = :fromMonth" ];

    if (leaveTypeId && Number(leaveTypeId) > 0) {
        conditions.push("num_leavetype_id = :leaveTypeId");
        binds.leaveTypeId = leaveTypeId;
    }

    if (empid && Number(empid) > 0) {
        conditions.push("num_leave_empid = :empid");
        binds.empid = empid;
    }

    const empColumn = Number(ulbid) === 770 ? "num_leave_empid" : "var_deptslip_sequence";

    const groupColumn = Number(ulbid) === 770 ? "num_leave_empid" : "var_deptslip_sequence";

    const sql = `
        SELECT
            var_employee_engname,
            var_leavetype_name,

            COUNT(date_fullday_date) AS totalleave,
            CASE
                WHEN date_leave_fromdate IS NULL THEN
                    LISTAGG(
                        TO_CHAR(date_fullday_date,'DD-MON-YYYY'),
                        ', '
                    ) WITHIN GROUP (
                        ORDER BY date_fullday_date
                    )
                ELSE
                    TO_CHAR(
                        date_leave_fromdate,
                        'DD-MON-YYYY'
                    )
                    || ' To ' ||
                    TO_CHAR(
                        date_leave_todate,
                        'DD-MON-YYYY'
                    )
            END AS leavedate,
            CASE
                WHEN var_fullday_type = 'F'
                THEN 'Full'
                ELSE 'Half'
            END AS leavetype,
            CASE
                WHEN var_leave_leavestatus = 'A'
                THEN 'Approved'
                WHEN var_leave_leavestatus = 'D'
                THEN 'DisApprove'
                ELSE 'Pending'
            END AS leavestatus,
            var_deptslip_code AS billno,
            ${empColumn} AS empid
        FROM AOPR_LEAVEMGNT_MST

        INNER JOIN AOPR_EMPLOYEE_DEF
            ON num_employee_empid = num_leave_empid

        INNER JOIN AOPR_LEAVETYPE_MST
            ON num_leavetype_id = var_leave_type

        INNER JOIN AOPR_FULLDAYLEAVE_DET
            ON num_fullday_leaveid = num_leave_id

        LEFT JOIN AOPR_DEPTSLIP_MAS
            ON num_deptslip_ulbid = num_employee_ulbid
           AND num_deptslip_empid = num_leave_empid

        WHERE ${conditions.join(" AND ")}

        GROUP BY
            var_employee_engname,
            var_leavetype_name,
            var_fullday_type,
            var_leave_leavestatus,
            date_leave_fromdate,
            date_leave_todate,
            ${groupColumn},
            var_deptslip_code

        ORDER BY var_employee_engname
    `;

    const result = await executeQuery(sql, binds);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

module.exports = {
    leaveTypeRepo,
    getLeaveReportRepo
}