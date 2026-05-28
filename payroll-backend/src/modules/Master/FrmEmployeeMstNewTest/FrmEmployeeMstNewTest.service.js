const repo = require("./FrmEmployeeMstNewTest.repo");

async function getEmployeeBankService(payload) {
  console.log("📥 Service: Fetch Employee Bank Details", payload);
  const data = await repo.getEmployeeBankRepo(payload);
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getSalaryEarningService(payload) {
  console.log("📥 Service: Fetch Salary Earnings", payload);
  const data = await repo.getSalaryEarningRepo(payload);
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getSalaryDeductionService(payload) {
  console.log("📥 Service: Fetch Salary Deductions", payload);
  const data = await repo.getSalaryDeductionRepo(payload);
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getGradeListService() {
  console.log("📥 Service: Fetch Grade List");
  const data = await repo.getGradeListRepo();
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getDesignationListService(payload) {
  console.log("📥 Service: Fetch Designation List", payload);
  const data = await repo.getDesignationListRepo(payload);
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getPayScaleListService(payload) {
  console.log("📥 Service: Fetch PayScale List", payload);
  const data = await repo.getPayScaleListRepo(payload);
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getReligionListService() {
  console.log("📥 Service: Fetch Religion List");
  const data = await repo.getReligionListRepo();
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getEmployeeCategoryService(payload) {
  console.log("📥 Service: Fetch Employee Category", payload);
  const data =
    await repo.getEmployeeCategoryRepo(payload);
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getFestivalListService() {
  console.log("📥 Service: Fetch Festival List");
  const data = await repo.getFestivalListRepo();
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getSelectionPostListService(payload) {
  console.log("📥 Service: Fetch Selection Post List", payload);
  const data = await repo.getSelectionPostListRepo(payload);
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getCastCategoryListService() {
  console.log("📥 Service: Fetch Cast Category List");
  const data = await repo.getCastCategoryListRepo();
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getBankBranchListService(payload) {
  console.log("📥 Service: Fetch Bank Branch List", payload);
  const data = await repo.getBankBranchListRepo(payload);
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getBranchMasterListService(payload) {
  console.log("📥 Service: Fetch Branch Master List", payload);
  const data = await repo.getBranchMasterListRepo(payload);
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getEmployeeAutoFillService(payload) {
  console.log("📥 Service: Employee AutoFill", payload);

  const data =
    await repo.getEmployeeAutoFillRepo(payload);
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getCasteListService(payload) {
  console.log("📥 Service: Fetch Caste List", payload);
  const data = await repo.getCasteListRepo(payload);
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getSubCasteListService(payload) {
  console.log("📥 Service: Fetch Sub Caste List", payload);
  const data = await repo.getSubCasteListRepo(payload);
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function saveEmployeeService(payload) {
  console.log("📥 Service: Save Employee", payload);

  const result = await repo.saveEmployeeRepo(payload);
  console.log("reult",result)
  return {
    success: result?.out_ErrorCode === -100,
    errorCode: result?.out_ErrorCode,
    message: result?.out_ErrorMsg,
    empId: result?.out_EmpId,
  };
}

async function updateEmployeeImagesService(payload) {
  console.log("📥 Service: Update Employee Images", payload);
  const data = await repo.updateEmployeeImagesRepo(payload);
  return {
    success: true,
    data,
  };
}

module.exports = {
  getEmployeeBankService,
  getSalaryEarningService,
  getSalaryDeductionService,
  getGradeListService,
  getDesignationListService,
  getPayScaleListService,
  getReligionListService,
  getEmployeeCategoryService,
  getFestivalListService,
  getSelectionPostListService,
  getCastCategoryListService,
  getBankBranchListService,
  getBranchMasterListService,
  getEmployeeAutoFillService,
  getCasteListService,
  getSubCasteListService,
  saveEmployeeService,
  updateEmployeeImagesService
};