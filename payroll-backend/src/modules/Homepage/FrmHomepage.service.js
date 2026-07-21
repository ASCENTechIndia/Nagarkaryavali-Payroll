const repo = require("./FrmHomepage.repo");

// ===============================
const getDepartmentWiseEmployee = async (ulbId) => {
  return await repo.getDepartmentWiseEmployeeRepo(ulbId);
};

// ===============================
const getGradeWiseEmployee = async (ulbId) => {
  return await repo.getGradeWiseEmployeeRepo(ulbId);
};

// ===============================
const getDepartmentWiseSalary = async (ulbId) => {
  return await repo.getDepartmentWiseSalaryRepo(ulbId);
};

module.exports = {
  getDepartmentWiseEmployee,
  getGradeWiseEmployee,
  getDepartmentWiseSalary,
};