const { executeQuery } = require("../../../db/queryExecutor");

async function getDepartmentListRepo({ ulbid }) {
    const sql = `
        SELECT deptname, deptid
        FROM vw_deptconfig
        WHERE ulbid = :ulbid
        ORDER BY deptname
    `;
    const result = await executeQuery(sql, { ulbid });
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getBillNoListRepo({ ulbid, deptId }) {
    const binds = { ulbid };

    let innerWhere = `WHERE 1 = 1 AND num_employee_ulbid = :ulbid`;
    if (deptId != null && String(deptId) !== "" && String(deptId) !== "0" && String(deptId) !== "-1") {
        innerWhere += ` AND num_employee_deptid = :deptId`;
        binds.deptId = Number(deptId);
    }

    const sql = `
        SELECT DISTINCT
            TO_CHAR(var_deptslip_code) AS billcode,
            var_deptslip_code          AS billno
        FROM aopr_deptslip_mas
        INNER JOIN (
            SELECT DISTINCT
                num_employee_empid,
                num_employee_ulbid
            FROM aopr_employee_def
            ${innerWhere}
        ) e
            ON e.num_employee_empid = num_deptslip_empid
           AND e.num_employee_ulbid = num_deptslip_ulbid
        WHERE num_deptslip_ulbid = :ulbid
          AND TRIM(var_deptslip_code) IS NOT NULL
        ORDER BY BILLCODE
    `;

    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getDeleteEmployeeReportRepo({ ulbid, deptId, billNo, empName, slipNo }) {
    const binds = {};

    let query = `
        SELECT
            SLIPNO,
            BILLNO,
            EMPLOYEENAME,
            EMPLOYEEDEPTID,
            DEPTNAME,
            TO_CHAR(DELETEDT, 'DD/MM/YYYY') AS DELETEDT
        FROM vw_deleteEmpRcord
        WHERE 1 = 1
    `;

    if (ulbid != null && ulbid !== "") {
        query += ` AND ULBID = :ulbid`;
        binds.ulbid = Number(ulbid);
    }

    if (deptId != null && String(deptId) !== "" && String(deptId) !== "0" && String(deptId) !== "-1") {
        query += ` AND EMPLOYEEDEPTID = :deptId`;
        binds.deptId = Number(deptId);
    }

    if (billNo != null && String(billNo).trim() !== "" && String(billNo) !== "0" && String(billNo) !== "-1") {
        query += ` AND BILLNO = :billNo`;
        binds.billNo = String(billNo).trim();
    }

    if (empName != null && String(empName).trim() !== "") {
        query += ` AND EMPLOYEENAME = :empName`;
        binds.empName = String(empName).trim();
    }

    if (slipNo != null && String(slipNo).trim() !== "") {
        query += ` AND SLIPNO = :slipNo`;
        binds.slipNo = String(slipNo).trim();
    }

    query += ` ORDER BY DELETEDT DESC, SLIPNO`;

    const result = await executeQuery(query, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

module.exports = {
    getDepartmentListRepo,
    getBillNoListRepo,
    getDeleteEmployeeReportRepo,
};
