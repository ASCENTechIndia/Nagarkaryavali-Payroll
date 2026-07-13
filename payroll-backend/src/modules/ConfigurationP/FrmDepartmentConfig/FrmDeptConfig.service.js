const repo = require("./FrmDeptConfig.repo");
const { AppError } = require("../../../libs/errors");

async function getDepartmentListService(ulbId) {
  return await repo.getDepartmentList(ulbId);
}

async function getConfiguredDepartmentsService(ulbId) {
  return await repo.getConfiguredDepartments(ulbId);
}

async function saveDepartmentConfigurationService(data) {

  if (!data.userId)
    throw new AppError("UserId is required");

  if (!data.ulbId)
    throw new AppError("ULB Id is required");

  if (!data.paramStr)
    throw new AppError("Configuration data is required");

  if (!data.mode)
    throw new AppError("Mode is required");

  return await repo.saveDepartmentConfiguration(data);
}

module.exports = {
  getDepartmentListService,
  getConfiguredDepartmentsService,
  saveDepartmentConfigurationService,
};