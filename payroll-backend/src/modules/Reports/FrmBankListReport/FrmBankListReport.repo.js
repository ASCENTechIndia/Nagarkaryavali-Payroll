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

// async function getBankListReportRepo({ ulbid, lastDate, deptId, bankId, subdeptId }) {
//     const binds = { ulbid, lastDate };

//     let query = `
//         SELECT
//             num_employee_empid                                          AS empid,
//             var_employee_engname                                        AS empname,
//             var_deptslip_sequence                                       AS slipno,
//             CASE
//                 WHEN num_employee_ulbid IN (770, 930, 1750)
//                      AND num_bankmst_bankid != 2
//                      AND TRIM(num_employee_bankaccno) IS NOT NULL
//                 THEN num_employee_bankaccno
//                 ELSE '-'
//             END                                                         AS indaccno,
//             CASE
//                 WHEN num_employee_ulbid IN (770, 930, 1750)
//                      AND num_bankmst_bankid = 2
//                      AND TRIM(num_employee_bankaccno) IS NOT NULL
//                 THEN num_employee_bankaccno
//                 ELSE '-'
//             END                                                         AS axisaccno,
//             CASE
//                 WHEN num_employee_ulbid NOT IN (770, 930, 1750)
//                      AND TRIM(num_employee_bankaccno) IS NOT NULL
//                 THEN num_employee_bankaccno
//                 ELSE '-'
//             END                                                         AS accno,
//             NVL(num_salary_totalearning, 0) - NVL(num_salary_totaldeduct, 0) AS payableamt,
//             var_deptslip_code                                           AS billno,
//             var_deptmst_deptnamee                                       AS deptname,
//             var_bankmst_bankname                                        AS bankname,
//             var_employee_oldempno                                       AS oldempno,
//             num_employee_ulbid                                          AS ulbid,
//             desig_mname                                                 AS designame,
//             var_deptsub_sdeptnamem                                      AS subdeptname,
//             num_employee_deptid                                         AS deptmst_code
//         FROM AOPR_SALARY_DEF
//         INNER JOIN aopr_Employee_def
//             ON num_employee_empid = Num_Salary_EmpId
//            AND num_employee_ulbid = num_salary_ulbid
//         LEFT JOIN vw_desigconfig
//             ON ulbid = num_employee_ulbid
//            AND desig_id = num_employee_desigid
//         INNER JOIN AOPR_DeptMst_def
//             ON num_deptmst_deptid = num_employee_deptid
//         LEFT JOIN aopr_deptslip_mas
//             ON num_employee_empid = num_deptslip_empid
//            AND num_employee_ulbid = num_deptslip_ulbid
//         LEFT JOIN aopr_subdept_mas
//             ON num_deptsub_ulbid = num_employee_ulbid
//            AND num_deptsub_id = num_employee_subdeptid
//            AND num_deptsub_deptid = num_employee_deptid
//         LEFT JOIN aopr_bankmst_def
//             ON num_bankmst_bankid = num_employee_bankid
//         WHERE 1 = 1
//           AND num_employee_ulbid = :ulbid
//           AND date_salary_saldate = TO_DATE(:lastDate, 'DD-MON-YYYY')
//           AND UPPER(TRIM(var_employee_engname)) NOT LIKE '%RIKT%'
//           AND UPPER(var_employee_engname) <> 'RIKT'
//           AND (NVL(num_salary_totalearning, 0) - NVL(num_salary_totaldeduct, 0)) <> 0
//     `;

//     if (deptId != null && Number(deptId) !== -1 && Number(deptId) !== 0) {
//         query += ` AND num_employee_deptid = :deptId`;
//         binds.deptId = Number(deptId);
//     }

//     if (subdeptId != null && Number(subdeptId) !== -1 && Number(subdeptId) !== 0) {
//         query += ` AND num_employee_subdeptid = :subdeptId`;
//         binds.subdeptId = Number(subdeptId);
//     }

//     if (bankId != null && Number(bankId) !== -1 && Number(bankId) !== 0) {
//         query += ` AND num_bankmst_bankid = :bankId`;
//         binds.bankId = Number(bankId);
//     }

//     query += ` ORDER BY num_employee_empid`;

//     const result = await executeQuery(query, binds);
//     if (!result.success) throw new Error(result.error);
//     return result.rows;
// }

async function getBankListReportRepo({ ulbid, lastDate, deptId, bankId, subdeptId, userId, billNo, empType }) {
  const ulbID = Number(ulbid);

  const binds = {
    ulbid: ulbID,
    lastDate,
  };

  let query = `
        SELECT
            num_employee_empid AS empid,
            var_employee_engname AS empname,
            var_deptslip_sequence AS slipno,

            CASE
                WHEN num_salary_ulbid IN (930)
                     AND num_bankmst_bankid <> 2
                     AND TRIM(num_employee_bankaccno) IS NOT NULL
                THEN num_employee_bankaccno
                ELSE '-'
            END AS indaccno,

            CASE
                WHEN num_salary_ulbid IN (930)
                     AND num_bankmst_bankid = 2
                     AND TRIM(num_employee_bankaccno) IS NOT NULL
                THEN num_employee_bankaccno
                ELSE '-'
            END AS axisaccno,

            CASE
                WHEN num_salary_ulbid NOT IN (1750)
                     AND TRIM(num_employee_bankaccno) IS NOT NULL
                THEN num_employee_bankaccno
                ELSE '-'
            END AS accno,

            NVL(num_salary_totalearning, 0)
                - NVL(num_salary_totaldeduct, 0) AS payableamt,

            var_deptslip_code AS billno,
            var_deptmst_deptnamee AS deptname,
            var_bankmst_bankname AS bankname,
            var_employee_oldempno AS oldempno,
            num_employee_ulbid AS ulbid,
            desig_mname AS designame,
            var_deptsub_sdeptnamem AS subdeptname,
            num_employee_deptid AS deptid,
            num_employee_subdeptid AS subdeptid
    `;

  // Additional columns for ULB 1750
  if (ulbID === 1750) {
    query += `,
            num_deptsalorder_orderno AS desigorder,
            var_employee_ifsc AS ifsc
        `;
  }

  query += `
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
    `;

  // User bill configuration for ULB 930 and 1750
  if (ulbID === 930 || ulbID === 1750) {
    query += `
            INNER JOIN Aopr_Userbill_Config
                ON num_userbill_ulbid = num_deptslip_ulbid
               AND num_userbill_userid = :userId
               AND num_userbill_billno = var_deptslip_code
        `;

    binds.userId = userId;
  }

  query += `
        LEFT JOIN aopr_subdept_mas
            ON num_deptsub_ulbid = num_employee_ulbid
           AND num_deptsub_id = num_employee_subdeptid
           AND num_deptsub_deptid = num_employee_deptid
    `;

  // Designation salary order join for ULB 1750
  if (ulbID === 1750) {
    query += `
            LEFT JOIN aopr_deptsalorder_det
                ON num_deptsalorder_deptid = num_employee_deptid
               AND num_deptsalorder_desigid = num_employee_desigid
               AND num_deptsalorder_subdeptid = num_employee_subdeptid
        `;
  }

  query += `
        LEFT JOIN aopr_bankmst_def
            ON num_bankmst_bankid = num_employee_bankid

        WHERE 1 = 1

          AND num_employee_ulbid = :ulbid

          AND date_salary_saldate =
              TO_DATE(:lastDate, 'DD-MON-YYYY')

          AND UPPER(TRIM(var_employee_engname))
              NOT LIKE '%RIKT%'
    `;

  // Department filter
  if (deptId != null && String(deptId) !== "-1" && String(deptId) !== "0" && String(deptId) !== "") {
    query += `
            AND num_employee_deptid = :deptId
        `;

    binds.deptId = Number(deptId);
  }

  // Subdepartment filter
  if (subdeptId != null && String(subdeptId).trim() !== "-1" && String(subdeptId).trim() !== "0" && String(subdeptId).trim() !== "") {
    query += `
            AND num_employee_subdeptid = :subdeptId
        `;

    binds.subdeptId = Number(subdeptId);
  }

  // Bill number filter only for ULB 1750
  if (ulbID === 1750 && billNo != null && String(billNo) !== "0" && String(billNo) !== "-1" && String(billNo).trim() !== "") {
    query += `
            AND var_deptslip_code = :billNo
        `;

    binds.billNo = String(billNo).trim();
  }

  // Bank filter
  if (bankId != null && String(bankId) !== "-1") {
    query += `
            AND num_bankmst_bankid = :bankId
        `;

    binds.bankId = Number(bankId);
  }

  // Employee status filter only for ULB 1750
  if (ulbID === 1750) {
    query += `
            AND VAR_EMPLOYEE_EMPSTATUS = :empType
            AND TRIM(UPPER(var_employee_engname))
                NOT LIKE '%RIKT%'
        `;

    binds.empType = String(empType ?? "").trim();
  }

  query += `
        AND UPPER(var_employee_engname) <> 'RIKT'

        AND (
            NVL(num_salary_totalearning, 0)
            - NVL(num_salary_totaldeduct, 0)
        ) <> 0
    `;

  // Additional employee exclusions for ULB 1630
  if (ulbID === 1630) {
    query += `
            AND UPPER(var_employee_oldempno) NOT IN (
                'COM1',
                'HLTH1',
                'ACOM1',
                'DCOM7',
                'ACCT1',
                'WCWD1',
                'TPD1',
                'TPD2',
                'TPD3',
                'TPD4'
            )
        `;
  }

  // ULB-specific sorting
  if (ulbID === 1750) {
    query += `
            ORDER BY
                CASE
                    WHEN REGEXP_LIKE(var_deptslip_code, '^[0-9]+$')
                    THEN 0
                    WHEN REGEXP_LIKE(var_deptslip_code, '^[0-9]')
                    THEN 1
                    ELSE 2
                END,

                CASE
                    WHEN REGEXP_LIKE(var_deptslip_code, '^[0-9]+$')
                    THEN TO_NUMBER(var_deptslip_code)
                    ELSE TO_NUMBER(
                        NVL(
                            REGEXP_SUBSTR(var_deptslip_code, '^[0-9]+'),
                            '0'
                        )
                    )
                END,

                NVL(
                    REGEXP_SUBSTR(var_deptslip_code, '[A-Za-z]+'),
                    ''
                ),

                TO_NUMBER(
                    NVL(
                        REGEXP_SUBSTR(var_deptslip_code, '[0-9]+$'),
                        '0'
                    )
                )
        `;
  } else if (ulbID === 1630) {
    query += `
            ORDER BY
                REGEXP_SUBSTR(
                    var_employee_oldempno,
                    '^[A-Za-z]+'
                ),

                TO_NUMBER(
                    REGEXP_SUBSTR(
                        var_employee_oldempno,
                        '[0-9]+'
                    )
                ),

                NVL(
                    TO_NUMBER(
                        REGEXP_SUBSTR(
                            var_employee_oldempno,
                            '-([0-9]+)$',
                            1,
                            1,
                            NULL,
                            1
                        )
                    ),
                    0
                )
        `;
  } else {
    query += `
            ORDER BY num_employee_empid
        `;
  }

  const result = await executeQuery(query, binds);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

module.exports = {
  getDepartmentListRepo,
  getBankListRepo,
  getBankListReportRepo,
};
