const repo = require("./FrmLoansAndAdvancesRpt.repo");

async function searchLoansAdvancesService(payload) {
  console.log("📥 Service: Search Loans and Advances", payload);

  const data = await repo.searchLoansAdvancesRepo(payload);

  return {
    success: true,
    count: data.length,
    data,
  };
}

module.exports = {
  searchLoansAdvancesService
};