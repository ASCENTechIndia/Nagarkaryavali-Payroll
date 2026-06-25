const repo = require("./FrmLoansAndAdvancesRpt.repo");

async function getCategoryListService({ ulbid }) {
  console.log("📥 Service: Fetch Category List", { ulbid });

  const data = await repo.getCategoryListRepo({ ulbid });

  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getZoneListService(payload) {
  console.log("📥 Service: Fetch Zone List", payload);

  const data = await repo.getZoneListRepo(payload);

  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getDepartmentListService(payload) {
  console.log("📥 Service: Fetch Department List", payload);

  const data = await repo.getDepartmentListRepo(payload);

  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getEmployeeListService(payload) {
  console.log("📥 Service: Fetch Employee List", payload);

  const data = await repo.getEmployeeListRepo(payload);

  return {
    success: true,
    count: data.length,
    data,
  };
}

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
  getCategoryListService,
  getZoneListService,
  getDepartmentListService,
  getEmployeeListService,
  searchLoansAdvancesService
};