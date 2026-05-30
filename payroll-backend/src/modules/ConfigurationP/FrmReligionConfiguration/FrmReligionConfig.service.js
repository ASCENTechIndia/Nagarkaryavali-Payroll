const repo = require("./FrmReligionConfig.repo");
const { AppError } = require("../../../libs/errors");


async function getReligionListService(payload) {

  if (!payload.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const data =
    await repo.getReligionListRepo(payload);

  return {
    success: true,
    count: data.length,
    data
  };
}

async function getConfiguredReligionService(payload) {

  if (!payload.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const data =
    await repo.getConfiguredReligionRepo(payload);

  return {
    success: true,
    count: data.length,
    data
  };
}

async function saveReligionConfigurationService(data) {

  if (!data.userId) {
    throw new AppError("User ID is required", 400);
  }

  if (!data.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  if (!data.religionStr) {
    throw new AppError("Religion String is required", 400);
  }

  const result =
    await repo.saveReligionConfigurationRepo(data);

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
  getReligionListService,
  getConfiguredReligionService,
  saveReligionConfigurationService
};