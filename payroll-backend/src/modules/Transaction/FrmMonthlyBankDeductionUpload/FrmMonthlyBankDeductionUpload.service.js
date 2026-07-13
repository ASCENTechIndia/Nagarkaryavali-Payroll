const repo = require("./FrmMonthlyBankDeductionUpload.repo");

// Pay Head
const getPayHeadList = async (ulbId) => {
  return await repo.getPayHeadList(ulbId);
};

// Department
const getDepartmentList = async (ulbId) => {
  return await repo.getDepartmentList(ulbId);
};

// Year List
const getYearList = async () => {
  return await repo.getYearList();
};

const getMonthlyBankDeductionExcelData = async (data) => {
  return await repo.getMonthlyBankDeductionExcelData(data);
};

// const uploadMonthlyBankDeduction = async (file, data) => {
//   return await repo.uploadMonthlyBankDeductionRepo(file, data);
// };
const uploadMonthlyBankDeduction = async (file) => {
  return await repo.uploadMonthlyBankDeductionRepo(file);
};

const submitMonthlyBankDeduction = async (data) => {
  return await repo.submitMonthlyBankDeductionRepo(data);
};

module.exports = {
  getPayHeadList,
  getDepartmentList,
  getYearList,
  getMonthlyBankDeductionExcelData,
  uploadMonthlyBankDeduction,
  submitMonthlyBankDeduction
};
