const repo = require("./FrmESevaLoanNAdvance.repo");

const getLoanAdvanceListService = async (ulbId, empId, esevaEmpId) => {
  return await repo.getLoanAdvanceListRepo(ulbId, empId, esevaEmpId);
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

module.exports = {
  getLoanAdvanceListService,
  insertLoanAndAdvanceService,
};
