const repo = require("./FrmPayCommissionConfig.repo");
const { AppError } = require("../../../libs/errors");


async function getPayCommissionListService(payload) {

  if (!payload.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const data =
    await repo.getPayCommissionListRepo(payload);

  return {
    success: true,
    count: data.length,
    data
  };
}


async function getConfiguredPayCommissionService(payload) {

  if (!payload.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const data =
    await repo.getConfiguredPayCommissionRepo(payload);

  return {
    success: true,
    count: data.length,
    data
  };
}


async function savePayCommissionConfigurationService(data) {

  if (!data.userId) {
    throw new AppError("User ID is required", 400);
  }

  if (!data.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  if (!data.payCommStr) {
    throw new AppError("Pay Commission String is required", 400);
  }

  const result =
    await repo.savePayCommissionConfigurationRepo(data);

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
  getPayCommissionListService,
  getConfiguredPayCommissionService,
  savePayCommissionConfigurationService
};