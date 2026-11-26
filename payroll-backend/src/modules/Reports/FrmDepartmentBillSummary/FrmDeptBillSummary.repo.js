
const { executeQuery } = require("../../../db/queryExecutor");

// 1. Summary Head Wise Salary
async function getSummaryHeadWiseSalaryRepo({
  fromDate,
  toDate,
  ulbId,
  employeeStatus
}) {
  const sql = `
    SELECT
      vw_summaryheadwisesal.*,
      (EARNING - DEDUCTION) AS NETPAY
    FROM
      vw_summaryheadwisesal
    WHERE
      DATE_SALARY_SALDATE >= TO_DATE(:fromDate, 'DD-MM-YYYY')
      AND DATE_SALARY_SALDATE < TO_DATE(:toDate, 'DD-MM-YYYY')
      AND NUM_SALARY_ULBID = :ulbId
      AND VAR_EMPLOYEE_EMPSTATUS = :employeeStatus
    ORDER BY
      SUMHEAD
  `;

  const binds = {
    fromDate,
    toDate,
    ulbId,
    employeeStatus
  };

  const result = await executeQuery(sql, binds);
console.log("COLUMN NAMES:", Object.keys(result.rows[0] || {}));
console.log("FIRST ROW DATA:", result.rows[0]);
  if (!result.success) throw new Error(result.error);

  return result.rows;
}


// 2. Department Payhead Summary
async function getDepartmentPayheadSummaryRepo({
  fromDate,
  toDate,
  ulbId,
  deptId
}) {
  const sql = `
    SELECT
      NUM_SALARY_DEPTID,
      VAR_DEPTMST_DEPTNAMEE AS DEPARTMENT_NAME,
      COUNT(DISTINCT NUM_SALARY_EMPID) AS TOTAL_EMP_COUNT,
      VAR_PAYHEADS_MNAME AS PAYHEAD_NAME_MARATHI,
      VAR_PAYHEADS_ENAME AS PAYHEAD_NAME_ENGLISH,
      VAR_PAYSUBHEADS_TYPE AS EARNTYPE,
      SUM(NVL(NUM_SALARYDTL_AMOUNT, 0)) AS TOTAL_PAYHEAD_AMOUNT,
      SUM(NVL(NUM_SALARY_TOTALEARNING, 0)) AS TOTAL_EARNING,
      SUM(NVL(NUM_SALARY_TOTALDEDUCT, 0)) AS TOTAL_DEDUCTION,
      NUM_PAYHEADS_ID,
      ORDERNO,
      '' AS DESIGNATION
    FROM
      VIEW_PAYSHEET
    WHERE
      DATE_SALARY_SALDATE >= TO_DATE(:fromDate, 'DD-MM-YYYY')
      AND DATE_SALARY_SALDATE < TO_DATE(:toDate, 'DD-MM-YYYY')
      AND ULBID = :ulbId
      AND NUM_SALARY_DEPTID = :deptId
    GROUP BY
      NUM_SALARY_DEPTID,
      VAR_DEPTMST_DEPTNAMEE,
      VAR_PAYHEADS_MNAME,
      VAR_PAYHEADS_ENAME,
      VAR_PAYSUBHEADS_TYPE,
      NUM_PAYHEADS_ID,
      ORDERNO
    ORDER BY
      VAR_DEPTMST_DEPTNAMEE,
      ORDERNO
  `;

  const binds = {
    fromDate,
    toDate,
    ulbId,
    deptId
  };

  const result = await executeQuery(sql, binds);

  if (!result.success) throw new Error(result.error);

  return result.rows;
}


// 3. Payhead Master
async function getPayheadMasterRepo(ulbId) {
  const sql = `
    SELECT
      NUM_PAYHEADS_ID,
      UTL_RAW.CAST_TO_VARCHAR2(
        HEXTORAW(
          REPLACE(
            RAWTOHEX(VAR_PAYHEADS_SHORTNAME),
            '2808DE',
            ''
          )
        )
      ) AS PAYHEADNAME,
      NUM_PAYHEADS_ORDERNO
    FROM
      AOPR_PAYHEADS_DEF
    INNER JOIN
      AOPR_PAYSUBHEADS_DEF
      ON NUM_PAYSUBHEADS_ID = NUM_PAYHEAD_SUBHEADID
    WHERE
      NUM_PAYHEADS_ULBID = :ulbId
      AND VAR_PAYSUBHEADS_TYPE IN ('D', 'E')
    GROUP BY
      NUM_PAYHEADS_ID,
      VAR_PAYHEADS_SHORTNAME,
      NUM_PAYHEADS_ORDERNO
    ORDER BY
      NUM_PAYHEADS_ORDERNO
  `;

  const result = await executeQuery(sql, { ulbId });

  if (!result.success) throw new Error(result.error);

  return result.rows;
}


module.exports = {
  getSummaryHeadWiseSalaryRepo,
  getDepartmentPayheadSummaryRepo,
  getPayheadMasterRepo
};
