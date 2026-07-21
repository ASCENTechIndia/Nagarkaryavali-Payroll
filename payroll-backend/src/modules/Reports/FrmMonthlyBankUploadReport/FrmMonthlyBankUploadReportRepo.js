const { executeQuery } = require("../../../db/queryExecutor");

async function getMonthlyBankUploadReportDataRepo({
  departmentId,
  lastDate,
}) {
  console.log("Repo: Fetch Monthly Bank Upload Report", {
    departmentId,
    lastDate,
  });

  const binds = {
    lastDate,
  };

  const conditions = [];
  conditions.push("dat_bankdeduct_saldate = :lastDate");

  if (Number(departmentId) !== -1) {
    conditions.push("num_bankdeduct_deptid = :departmentId");
    binds.departmentId = Number(departmentId);
  }

  const sql = `
    SELECT
        num_bankdeduct_empid       AS EMPLOYEE_CODE,
        var_bankdeduct_empname     AS EMPLOYEE_NAME,
        var_bankdeduct_deptname    AS DEPARTMENT,
        TO_CHAR(dat_bankdeduct_saldate,'DD/MM/YYYY') AS SALARY_MONTH_YEAR,
        var_bankdeduct_payheadname AS DEDUCTION_PAYHEAD,
        num_bankdeduct_amount      AS DEDUCTION_AMOUNT,
        var_bankdeduct_remark      AS REMARKS
    FROM aoms_bankdeduct_mas
    WHERE ${conditions.join(" AND ")}
    ORDER BY
        var_bankdeduct_deptname,
        var_bankdeduct_empname
  `;

  console.log("SQL:", sql);
  console.log("Binds:", binds);

  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

module.exports = {
  getMonthlyBankUploadReportDataRepo,
};