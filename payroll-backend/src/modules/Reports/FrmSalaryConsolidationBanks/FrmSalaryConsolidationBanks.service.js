const repo = require("./FrmSalaryConsolidationBanks.repo");

async function getSalaryConsolidationBankReportService(payload) {
  console.log("📥 Service: Salary Consolidation Report",payload);
  const data = await repo.getSalaryConsolidationBankReportRepo(payload);

   if (!data || data.length === 0) {
    return {
      success: false,
      message: "No data found",
    };
  }
  return {
    success: true,
    count: data.length,
    data,
  };
}

module.exports = {
  getSalaryConsolidationBankReportService,
};