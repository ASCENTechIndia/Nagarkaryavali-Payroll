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

async function getCashReportRepo({ ulbid, lstdate, deptId, paymode, empType }) {
    const binds = { ulbid, lstdate };
    const ulbStr = String(ulbid);

    let query = `
        SELECT
            empid,
            empname,
            slipno,
            indaccno,
            axisaccno,
            billno,
            payableamt
        FROM vw_cashnchkjcmc
        WHERE 1 = 1
          AND ulbid = :ulbid
          AND saldate = TO_DATE(:lstdate, 'DD-MON-YYYY')
          AND payableamt > 0
    `;

    if (ulbStr === "770" || ulbStr === "1750") {
        query += `
            AND var_employee_empstatus = :empType
            AND TRIM(UPPER(empname)) NOT LIKE '%RIKT%'
        `;
        binds.empType = empType;
    } else if (ulbStr === "930" && empType) {
        query += `
            AND var_employee_empstatus = :empType
        `;
        binds.empType = empType;
    }

    if (deptId != null && String(deptId) !== "-1" && String(deptId) !== "0" && deptId !== "") {
        query += ` AND deptid = :deptId`;
        binds.deptId = Number(deptId);
    }

    if (paymode != null && String(paymode) !== "-1" && String(paymode) !== "0" && paymode !== "") {
        query += ` AND paymodeid = :paymode`;
        binds.paymode = Number(paymode);
    }

    query += ` ORDER BY empid`;

    const result = await executeQuery(query, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getDcpsReportRepo({ ulbid, lstdate, empType }) {
    const binds = { ulbid, lstdate };
    const ulbStr = String(ulbid);

    let query = `
        SELECT
            num_employee_empid    AS empid,
            var_employee_engname  AS empname,
            var_deptslip_sequence AS slipno,
            var_deptslip_code     AS billno,
            e_basic,
            e_gp,
            e_da,
            e_dcps14,
            d_dcps10,
            d_dcps14,
            0 AS e_dadiff,
            0 AS e_dcpsdiff14,
            0 AS d_dcpsdiff10,
            0 AS d_dcpsdiff14,
            NVL(e_basic, 0) + NVL(e_gp, 0) + NVL(e_da, 0) +
            NVL(e_dcps14, 0) + NVL(d_dcps10, 0) + NVL(d_dcps14, 0) AS total
        FROM aopr_employee_def
        INNER JOIN vw_dcpsjcmc
            ON ulbid = num_employee_ulbid
           AND empid = num_employee_empid
        LEFT JOIN aopr_deptslip_mas
            ON num_employee_empid = num_deptslip_empid
           AND num_employee_ulbid = num_deptslip_ulbid
        WHERE num_employee_ulbid = :ulbid
          AND saldate = TO_DATE(:lstdate, 'DD-MON-YYYY')
    `;

    if (ulbStr === "770" || ulbStr === "1750" || ulbStr === "930") {
        query += `
            AND var_employee_empstatus = :empType
            AND TRIM(UPPER(var_employee_engname)) NOT LIKE '%RIKT%'
        `;
        binds.empType = empType;
    }

    query += ` ORDER BY num_employee_empid`;

    const result = await executeQuery(query, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getPayslipEmpIdsByStatusRepo({ ulbid, lstdate, deptId, empType }) {
    const binds = { ulbid: Number(ulbid), lstdate, empType };

    let query = `
        SELECT DISTINCT num_salary_empid AS empid
        FROM view_paysheet
        WHERE ulbid = :ulbid
          AND date_salary_saldate = TO_DATE(:lstdate, 'DD-MON-YYYY')
          AND var_employee_empstatus = :empType
    `;

    if (deptId != null && String(deptId) !== "-1" && String(deptId) !== "0" && deptId !== "") {
        query += ` AND num_salary_deptid = :deptId`;
        binds.deptId = Number(deptId);
    }

    const result = await executeQuery(query, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows.map((r) => Number(r.EMPID));
}

async function getCorporationAddressRepo({ ulbid }) {
    const sql = `
        SELECT var_corporation_address AS corporationaddress
        FROM admins.aoma_corporation_mas
        WHERE num_corporation_id = :ulbid
    `;
    const result = await executeQuery(sql, { ulbid: Number(ulbid) });
    if (!result.success) return "";
    return result.rows?.[0]?.CORPORATIONADDRESS || "";
}

module.exports = {
    getDepartmentListRepo,
    getCashReportRepo,
    getDcpsReportRepo,
    getPayslipEmpIdsByStatusRepo,
    getCorporationAddressRepo,
};
