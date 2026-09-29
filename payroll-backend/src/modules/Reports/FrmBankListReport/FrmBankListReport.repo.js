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

async function getBankListRepo({ ulbid }) {
    const sql = `
        SELECT bankname, bankid
        FROM vw_bankconf
        WHERE ulbid = :ulbid
        ORDER BY bankname
    `;
    const result = await executeQuery(sql, { ulbid });
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getBankListReportRepo({ ulbid, lastDate, deptId, bankId, subdeptId }) {
    const binds = { ulbid, lastDate };

    let query = `
        SELECT
            num_employee_empid                                          AS empid,
            var_employee_engname                                        AS empname,
            var_deptslip_sequence                                       AS slipno,
            CASE
                WHEN num_employee_ulbid IN (770, 930, 1750)
                     AND num_bankmst_bankid != 2
                     AND TRIM(num_employee_bankaccno) IS NOT NULL
                THEN num_employee_bankaccno
                ELSE '-'
            END                                                         AS indaccno,
            CASE
                WHEN num_employee_ulbid IN (770, 930, 1750)
                     AND num_bankmst_bankid = 2
                     AND TRIM(num_employee_bankaccno) IS NOT NULL
                THEN num_employee_bankaccno
                ELSE '-'
            END                                                         AS axisaccno,
            CASE
                WHEN num_employee_ulbid NOT IN (770, 930, 1750)
                     AND TRIM(num_employee_bankaccno) IS NOT NULL
                THEN num_employee_bankaccno
                ELSE '-'
            END                                                         AS accno,
            NVL(num_salary_totalearning, 0) - NVL(num_salary_totaldeduct, 0) AS payableamt,
            var_deptslip_code                                           AS billno,
            var_deptmst_deptnamee                                       AS deptname,
            var_bankmst_bankname                                        AS bankname,
            var_employee_oldempno                                       AS oldempno,
            num_employee_ulbid                                          AS ulbid,
            desig_mname                                                 AS designame,
            var_deptsub_sdeptnamem                                      AS subdeptname,
            num_employee_deptid                                         AS deptmst_code
        FROM AOPR_SALARY_DEF
        INNER JOIN aopr_Employee_def
            ON num_employee_empid = Num_Salary_EmpId
           AND num_employee_ulbid = num_salary_ulbid
        LEFT JOIN vw_desigconfig
            ON ulbid = num_employee_ulbid
           AND desig_id = num_employee_desigid
        INNER JOIN AOPR_DeptMst_def
            ON num_deptmst_deptid = num_employee_deptid
        LEFT JOIN aopr_deptslip_mas
            ON num_employee_empid = num_deptslip_empid
           AND num_employee_ulbid = num_deptslip_ulbid
        LEFT JOIN aopr_subdept_mas
            ON num_deptsub_ulbid = num_employee_ulbid
           AND num_deptsub_id = num_employee_subdeptid
           AND num_deptsub_deptid = num_employee_deptid
        LEFT JOIN aopr_bankmst_def
            ON num_bankmst_bankid = num_employee_bankid
        WHERE 1 = 1
          AND num_employee_ulbid = :ulbid
          AND date_salary_saldate = TO_DATE(:lastDate, 'DD-MON-YYYY')
          AND UPPER(TRIM(var_employee_engname)) NOT LIKE '%RIKT%'
          AND UPPER(var_employee_engname) <> 'RIKT'
          AND (NVL(num_salary_totalearning, 0) - NVL(num_salary_totaldeduct, 0)) <> 0
    `;

    if (deptId != null && Number(deptId) !== -1 && Number(deptId) !== 0) {
        query += ` AND num_employee_deptid = :deptId`;
        binds.deptId = Number(deptId);
    }

    if (subdeptId != null && Number(subdeptId) !== -1 && Number(subdeptId) !== 0) {
        query += ` AND num_employee_subdeptid = :subdeptId`;
        binds.subdeptId = Number(subdeptId);
    }

    if (bankId != null && Number(bankId) !== -1 && Number(bankId) !== 0) {
        query += ` AND num_bankmst_bankid = :bankId`;
        binds.bankId = Number(bankId);
    }

    query += ` ORDER BY num_employee_empid`;

    const result = await executeQuery(query, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

module.exports = {
    getDepartmentListRepo,
    getBankListRepo,
    getBankListReportRepo,
};
