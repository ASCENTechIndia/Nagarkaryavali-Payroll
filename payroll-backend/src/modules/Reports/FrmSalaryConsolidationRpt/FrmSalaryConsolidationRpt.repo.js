const { executeQuery } = require("../../../db/queryExecutor");

async function getSalaryConsolidationReportRepo({
  ulbid,
  salaryDate,
  reportType,
  deptid,
}) {
  console.log("📤 Repo: Salary Consolidation Report", {
    ulbid,
    salaryDate,
    reportType,
    deptid,
  });

  // Decide which view to query
  const viewName =
    reportType === "D"
      ? "vw_smkcdepwisesal"
      : "vw_smkcempwisesal";

  const conditions = [];
  const binds = {};

  // ULB
  conditions.push("ULBID = :ulbid");
  binds.ulbid = ulbid;

  // Salary Date
  conditions.push("DATE_SALARY_SALDATE = :salaryDate");
  binds.salaryDate = new Date(salaryDate);

  // Optional Department Filter
  if (
    deptid !== undefined &&
    deptid !== null &&
    deptid !== "" &&
    Number(deptid) !== -1
  ) {
    conditions.push("DEPTID = :deptid");
    binds.deptid = deptid;
  }

  const sql = `
    SELECT *
    FROM ${viewName}
    WHERE ${conditions.join(" AND ")}
  `;

  console.log(sql);
  console.log("Binds:", binds);

  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }

  // Remove columns exactly like the old .NET code
  const rows = result.rows.map((row) => {
    delete row.ULBID;
    delete row.DATE_SALARY_SALDATE;
    return row;
  });

  return rows;
}

module.exports = {
  getSalaryConsolidationReportRepo,
};