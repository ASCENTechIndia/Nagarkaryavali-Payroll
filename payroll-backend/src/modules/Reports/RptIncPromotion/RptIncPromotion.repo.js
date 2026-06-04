const { executeQuery } = require("../../../db/queryExecutor")

const getIncPromotionReportRepo = async({ ulbid, empid, deptid, zoneid, type, empstatus, fromDate, toDate }) => {
    console.log("📤 Repo: Increment Promotion Report", { ulbid, empid, deptid, zoneid, type, empstatus, fromDate, toDate });

    const binds = { ulbid };
    const conditions = [
        "num_incpromo_ulbid = :ulbid",
        "var_incpromo_type IS NOT NULL"
    ];

    if (empid && Number(empid) > 0) {
        conditions.push("num_incpromo_empid = :empid");
        binds.empid = empid;
    }

    if (deptid && Number(deptid) > 0) {
        conditions.push( "num_incpromo_deptid = :deptid" );
        binds.deptid = deptid;
    }

    if (zoneid && Number(zoneid) > 0) {
        conditions.push( "num_employee_zone = :zoneid" );
        binds.zoneid = zoneid;
    }

    if (type) {
        conditions.push( "var_incpromo_type = :type" );
        binds.type = type;
    }

    if (empstatus && [770, 1750].includes(Number(ulbid))) {
        conditions.push( "var_employee_empstatus = :empstatus" );
        binds.empstatus = empstatus;
    }

    if (fromDate && toDate) {
        conditions.push(` TRUNC(date_incpromo_effectivefrom) BETWEEN TRUNC(:fromDate) AND TRUNC(:toDate) `);
        binds.fromDate = new Date(fromDate);
        binds.toDate = new Date(toDate);
    }

    const employeeColumn = [770].includes(Number(ulbid)) ? "var_deptslip_sequence" : "num_incpromo_empid";

    const sql = `
        SELECT
            ${employeeColumn} EmployeeId,
            var_employee_engname EmployeeName,
            var_deptmst_deptnamee Department,
            var_zone_name SubDepartment,
            date_incpromo_effectivefrom EffectiveFrom,
            CASE
                WHEN var_incpromo_type = 'I'
                THEN 'Increment'
                ELSE 'Promotion'
            END Type,
            var_inctype_name IncrementType,
            var_promotion_name PromotionType,
            num_incpromo_orderno OrderNo,
            date_incpromo_orderdate OrderDate,
            num_incpromo_currgrade CurrentGrade,
            num_incpromo_newgrade NewGrade,
            num_incpromo_currdesg CurrentDesignation,
            num_incpromo_newdesg NewDesignation,
            num_incpromo_currpayscale CurrentPayScale,
            num_incpromo_newpayscale NewPayScale,
            num_incpromo_currbasic CurrentBasic,
            num_incpromo_newbasic NewBasic,
            num_incpromo_currgradepay CurrentGradePay,
            num_incpromo_newgradepay NewGradePay,
            date_incpromo_insdate InsDate,
            var_deptslip_code BillNo
        FROM aopr_incpromotion_def
        INNER JOIN aopr_employee_def
            ON num_incpromo_empid = num_employee_empid
           AND num_incpromo_ulbid = num_employee_ulbid
        INNER JOIN aopr_deptmst_def
            ON num_incpromo_deptid = num_deptmst_deptid
        INNER JOIN aopr_zone_mas
            ON num_employee_zone = num_zone_id
        LEFT JOIN aopr_promotion_mst
            ON num_promotion_id = num_incpromo_promotype
        LEFT JOIN aopr_increamenttype_mst
            ON num_inctype_id = num_incpromo_inctype
        LEFT JOIN aopr_deptslip_mas
            ON num_deptslip_ulbid = num_incpromo_ulbid
           AND num_deptslip_empid = num_incpromo_empid
        WHERE ${conditions.join(" AND ")}
        ORDER BY var_employee_engname
    `;

    const result = await executeQuery(sql, binds);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

module.exports = {
    getIncPromotionReportRepo,
}