const repo = require("./FrmBankConfig.repo");
const { AppError } = require("../../../libs/errors");


async function getConfiguredBankService(payload) {

  if (!payload.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const data =
    await repo.getConfiguredBankRepo(payload);

  return {
    success: true,
    count: data.length,
    data
  };
}


async function getBankListService(payload) {

  if (!payload.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const data =
    await repo.getBankListRepo(payload);

  return {
    success: true,
    count: data.length,
    data
  };
}


async function saveBankConfigurationService(data) {

  if (!data.userId) {
    throw new AppError("User ID is required", 400);
  }

  if (!data.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  if (!data.bankStr) {
    throw new AppError("Bank String is required", 400);
  }

  const result =
    await repo.saveBankConfigurationRepo(data);

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
  getConfiguredBankService,
  getBankListService,
  saveBankConfigurationService
};