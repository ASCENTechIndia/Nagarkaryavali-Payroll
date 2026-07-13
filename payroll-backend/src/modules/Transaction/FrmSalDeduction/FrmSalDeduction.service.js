const repo = require("./FrmSalDeduction.repo");

// ===============================
// Get Deduction Head List
// ===============================
const getDeductionHeadList = async (ulbId) => {
  return await repo.getDeductionHeadList(ulbId);
};


// ===============================
// Get Employee List
// ===============================
const getEmployeeList = async (data) => {
  return await repo.getEmployeeList(data);
};


// ===============================
// Insert Salary Deduction
// ===============================
const insertSalDeduction = async (data) => {
  return await repo.insertSalDeductionRepo(data);
};


module.exports = {
  getDeductionHeadList,
  getEmployeeList,
  insertSalDeduction
};