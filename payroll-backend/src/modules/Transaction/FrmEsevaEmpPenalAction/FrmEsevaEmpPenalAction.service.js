const repo = require("./FrmEsevaEmpPenalAction.repo");

const getActionTypeListService = async () => {
  return await repo.getActionTypeListRepo();
};

const getPensionImpactListService = async () => {
  return await repo.getPensionImpactListRepo();
};

const getPenalActionDetailsService = async (ulbId, empId, esevaEmpId) => {
  return await repo.getPenalActionDetailsRepo(ulbId, empId, esevaEmpId);
};

// Insert / Update Penal Action
const insertPenalActionService = async (payload) => {
  const result = await repo.insertPenalActionRepo(payload);

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
  getActionTypeListService,
  getPensionImpactListService,
  getPenalActionDetailsService,
  insertPenalActionService
};
