const repo = require("./FrmEmployeeMstList.repo");

async function getEmployeeCategoryService() {
  console.log("📥 Service: Fetch Employee Categories");

  const data = await repo.getEmployeeCategoryRepo();

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

async function getSubDepartmentListService(payload) {
  console.log("📥 Service: Fetch Sub Department List", payload);

  const data = await repo.getSubDepartmentListRepo(payload);

  return {
    success: true,
    count: data.length,
    data,
  };
}

async function searchEmployeeService(payload) {
  console.log("📥 Service: Search Employee", payload);

  const data = await repo.searchEmployeeRepo(payload);

  return {
    success: true,
    count: data.length,
    data,
  };
}

module.exports = {
  getEmployeeCategoryService,
  getZoneListService,
  getDepartmentListService,
  getSubDepartmentListService,
  searchEmployeeService
};