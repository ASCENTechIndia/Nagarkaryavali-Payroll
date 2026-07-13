const repo = require("./FrmMonthlyBankDeductionUploadAuth.repo");

// ===============================
// Get Monthly Bank Deduction Authorization List
// ===============================
const getMonthlyBankDeductionAuthList = async () => {
  return await repo.getMonthlyBankDeductionAuthList();
};

// ===============================
// Get Monthly Bank Deduction Authorization Details
// ===============================
const getMonthlyBankDeductionAuthDetails = async (mainId) => {
  return await repo.getMonthlyBankDeductionAuthDetails(mainId);
};



module.exports = {
  getMonthlyBankDeductionAuthList,
  getMonthlyBankDeductionAuthDetails
};