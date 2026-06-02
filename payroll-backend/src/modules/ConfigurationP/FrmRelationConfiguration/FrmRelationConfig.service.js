const repo = require("./FrmRelationConfig.repo");
const { AppError } = require("../../../libs/errors");


async function getRelationListService(payload) {

  if (!payload.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const data =
    await repo.getRelationListRepo(payload);

  return {
    success: true,
    count: data.length,
    data
  };
}

async function getConfiguredRelationService(payload) {

  if (!payload.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const data =
    await repo.getConfiguredRelationRepo(payload);

  return {
    success: true,
    count: data.length,
    data
  };
}


async function saveRelationConfigurationService(data) {

  if (!data.userId) {
    throw new AppError("User ID is required", 400);
  }

  if (!data.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  if (!data.relationStr) {
    throw new AppError("Relation String is required", 400);
  }

  const result =
    await repo.saveRelationConfigurationRepo(data);

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    errorCode: result.errorCode,
    errorMsg: result.errorMsg,
    message: result.errorMsg
  };
}

module.exports = {
  getRelationListService,
  getConfiguredRelationService,
  saveRelationConfigurationService
};