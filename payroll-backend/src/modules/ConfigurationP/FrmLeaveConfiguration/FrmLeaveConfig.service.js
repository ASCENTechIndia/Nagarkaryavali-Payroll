const repo = require("./FrmLeaveConfig.repo");
const { AppError } = require("../../../libs/errors");


async function getConfiguredLeaveService(payload) {

  if (!payload.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const data =
    await repo.getConfiguredLeaveRepo(payload);

  return {
    success: true,
    count: data.length,
    data
  };
}


async function getLeaveListService(payload) {

  if (!payload.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const data =
    await repo.getLeaveListRepo(payload);

  return {
    success: true,
    count: data.length,
    data
  };
}



async function saveLeaveConfigurationService(data) {

  if (!data.userId) {
    throw new AppError("User ID is required", 400);
  }

  if (!data.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  if (!data.leaveStr) {
    throw new AppError("Leave String is required", 400);
  }

  const result =
    await repo.saveLeaveConfigurationRepo(data);

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
  getConfiguredLeaveService,
  getLeaveListService,
  saveLeaveConfigurationService
};