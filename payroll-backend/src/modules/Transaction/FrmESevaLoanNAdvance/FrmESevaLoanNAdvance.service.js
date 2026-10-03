const repo = require("./FrmESevaLoanNAdvance.repo");

const getLoanAdvanceListService = async (ulbId, empId, esevaEmpId) => {
  const result = await repo.getLoanAdvanceListRepo(ulbId, empId, esevaEmpId);
  return result.rows;
};

const insertLoanAndAdvanceService = async (payload) => {
  const result = await repo.insertLoanAndAdvanceRepo(payload);

  if (result.errorCode === 9999) {
    return {
      success: true,
      errorCode: result.errorCode,
      errorMsg: result.errorMsg,
    };
  }

  return {
    success: false,
    errorCode: result.errorCode,
    errorMsg: result.errorMsg,
  };
};

const updateLoanAdvanceSignatureService = async (imageBuffer, empId, ulbId, esevaEmpId) => {
  // console.log({imageBuffer, empId, ulbId, esevaEmpId});
  return await repo.updateLoanAdvanceSignatureRepo(imageBuffer, empId, ulbId, esevaEmpId);
};

module.exports = {
  getLoanAdvanceListService,
  insertLoanAndAdvanceService,
  updateLoanAdvanceSignatureService
};
