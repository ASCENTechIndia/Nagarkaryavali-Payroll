const repo = require("./FrmBranchConfig.repo");
const { AppError } = require("../../../libs/errors");

async function getCorporationListService() {

  const data =
    await repo.getCorporationListRepo();

  return {
    success: true,
    count: data.length,
    data
  };
}

async function getBranchListService(payload) {

  if (!payload.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const data =
    await repo.getBranchListRepo(payload);

  return {
    success: true,
    count: data.length,
    data
  };
}

async function getConfiguredBranchService(payload) {

  if (!payload.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const data =
    await repo.getConfiguredBranchRepo(payload);

  return {
    success: true,
    count: data.length,
    data
  };
}

async function saveBranchConfigurationService(data) {

  if (!data.userId) {
    throw new AppError("User ID required", 400);
  }

  if (!data.ulbId) {
    throw new AppError("ULB ID required", 400);
  }

  if (!data.branchStr) {
    throw new AppError("Branch String required", 400);
  }

  const result =
    await repo.saveBranchConfigurationRepo(data);

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
  getCorporationListService,
  getBranchListService,
  getConfiguredBranchService,
  saveBranchConfigurationService
};