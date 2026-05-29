const repo = require("./FrmSalaryCalculation.repo");

async function getEmployeeListService() {
  console.log("📥 Service: Fetch Employee List");
  const data = await repo.getEmployeeListRepo();
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getBillListService(payload) {
  console.log("📥 Service: Fetch Bill List", payload);
  const data = await repo.getBillListRepo(payload);
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function calculateSalaryService(payload) {
    console.log("📥 Service: Salary Calculation", payload);
    const data = await repo.calculateSalaryRepo(payload);
    return {
        success: true,
        errorCode: data.out_ErrorCode,
        errorMsg: data.out_ErrorMsg,
    };
}

async function deleteSalaryService(payload) {
    console.log("📥 Service: Delete Salary", payload);
    const data = await repo.deleteSalaryRepo(payload);
    return {
        success: true,
        errorCode: data.out_ErrorCode,
        errorMsg: data.out_ErrorMsg,
    };
}

module.exports = {
  getEmployeeListService,
  getBillListService,
  calculateSalaryService,
  deleteSalaryService
};