const repo = require("./FrmESevaIncrAndPromotion.repo");

const getIncrementListService = async (ulbId, empId, esevaEmpId) => {
  return await repo.getIncrementListRepo(ulbId, empId, esevaEmpId);
};

const getPromotionListService = async (ulbId, empId, esevaEmpId) => {
  return await repo.getPromotionListRepo(ulbId, empId, esevaEmpId);
};

const insertIncrementAndPromotionService = async (payload) => {
  const result = await repo.insertIncrementAndPromotionRepo(payload);

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
  getIncrementListService,
  getPromotionListService,
  insertIncrementAndPromotionService
};
