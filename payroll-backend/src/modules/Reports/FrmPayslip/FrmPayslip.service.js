const repo = require("./FrmPayslip.repo");

// ===============================
// Get Employee Details
// ===============================
const getEmployeeDetails = async (data) => {
  return await repo.getEmployeeDetails(data);
};


//=====================================
// Pay Slip Report
//=====================================

const getPaySlipService = async (payload) => {

  const result = await repo.getPaySlip(payload);

  return {
    success: true,
    data: result,
  };

};


module.exports = {
  getEmployeeDetails,
  getPaySlipService
};