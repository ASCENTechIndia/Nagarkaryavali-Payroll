const { executeQuery } = require("../../../db/queryExecutor");

async function getSalaryConsolidationBankReportRepo({ ulbid, fromDate, toDate, deptId, reportType }) {
  const binds = {
    ulbid,
    fromDate: fromDate,
    toDate: toDate,
  };

  const viewName = reportType === "D" ? "vw_smkcdepwisesal" : reportType === "E" ? "vw_smkcempwisesal" : null;
  if (!viewName) {
    throw new Error("Invalid reportType");
  }
  const conditions = [
    "ulbid = :ulbid",
    "DATE_SALARY_SALDATE BETWEEN TO_DATE(:fromDate,'YYYY-MM-DD') AND TO_DATE(:toDate,'YYYY-MM-DD')",
  ];
  if (deptId && Number(deptId) > 0) {
    conditions.push("DEPTID = :deptId");
    binds.deptId = deptId;
  }
  const sql = `
    SELECT *
    FROM ${viewName}
    WHERE ${conditions.join(" AND ")}
    ORDER BY DATE_SALARY_SALDATE
  `;
  
  const result = await executeQuery(sql, binds);
  console.log({sql, binds, result})
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.rows;
}

module.exports = {
  getSalaryConsolidationBankReportRepo,
};