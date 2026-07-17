const repo = require("./FrmSalaryConsolidationRpt.repo");

async function getSalaryConsolidationReportService(payload) {
  console.log(
    "📥 Service: Salary Consolidation Report",
    payload
  );

  const data = await repo.getSalaryConsolidationReportRepo(payload);

  return {
    success: true,
    count: data.length,
    data,
  };
}

module.exports = {
  getSalaryConsolidationReportService,
};