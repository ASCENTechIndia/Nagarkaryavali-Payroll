const repo = require("./FrmPayHeadListMst.repo");
const { AppError } = require("../../../libs/errors");

// ✅ Get PayHeads List Service
const getPayHeadsListService = async (body) => {
  const { ulbId } = body;

  if (!ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  return await repo.getPayHeadsList(body);
};

const getPaySubHeadsListService = async () => {
  return await repo.getPaySubHeadsList();
};

const getParentPayHeadsListService = async (body) => {
  const { paySubHeadId, ulbId } = body;

  if (!paySubHeadId) {
    throw new AppError("paySubHeadId is required", 400);
  }

  if (!ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  return await repo.getParentPayHeadsList(body);
};

const getPayHeadDetailsByIdService = async (body) => {
  const { payHeadId } = body;

  if (!payHeadId) {
    throw new AppError("payHeadId is required", 400);
  }

  return await repo.getPayHeadDetailsById(body);
};

const savePayHeadService = async (body) => {
  const result = await repo.savePayHead(body);

  console.log("Procedure Result =>", result);

  if (result.Out_ErrorCode < 0 && result.Out_ErrorCode !== -100) {
    throw new AppError(result.out_ErrorMsg, 400);
  }

  return {
    success: true,
    errorCode: result.Out_ErrorCode,
    message: result.out_ErrorMsg,
  };
};

module.exports = {
  getPayHeadsListService,
  getPaySubHeadsListService,
  getParentPayHeadsListService,
  getPayHeadDetailsByIdService,
  savePayHeadService,
};
