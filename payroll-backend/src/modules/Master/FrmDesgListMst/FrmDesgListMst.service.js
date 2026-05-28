const repo = require("./FrmDesgListMst.repo");
const { AppError } = require("../../../libs/errors");

// ✅ Get Designation List Service
const getDesignationListService = async () => {
  return await repo.getDesignationList();
};

// ✅ Search Designation List Service
const searchDesignationListService = async (body) => {
  return await repo.searchDesignationList(body);
};

// ✅ Get Designation Details By Id Service
const getDesignationDetailsByIdService = async (body) => {
  const { desgId } = body;

  if (!desgId) {
    throw new AppError("desgId is required", 400);
  }

  return await repo.getDesignationDetailsById(body);
};

const saveDesignationService = async (body) => {
  const { userId, desgName, mode } = body;

  if (!userId) {
    throw new AppError("userId is required", 400);
  }

  if (!desgName) {
    throw new AppError("Designation Name is required", 400);
  }

  if (desgName.length > 100) {
    throw new AppError("Designation name maximum length exceeded", 400);
  }

  if (!mode) {
    throw new AppError("mode is required", 400);
  }

  const result = await repo.saveDesignation(body);

  if (result.out_ErrorCode < 0 && result.out_ErrorCode !== -100) {
    throw new AppError(result.out_ErrorMsg, 400);
  }

  return {
    success: true,
    errorCode: result.out_ErrorCode,
    message: result.out_ErrorMsg,
  };
};

module.exports = {
  getDesignationListService,
  searchDesignationListService,
  getDesignationDetailsByIdService,
  saveDesignationService,
};
