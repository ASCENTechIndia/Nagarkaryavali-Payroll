const repo = require("./FrmPayHeadConfigList.repo");
const { AppError } = require("../../../libs/errors");

async function getPayHeadListService(body) {
  if (!body.ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  return await repo.getPayHeadListRepo(body);
}

async function getPayHeadConfigListService(body) {
  if (!body.categoryId) {
    throw new AppError("categoryId is required", 400);
  }

  if (!body.ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  return await repo.getPayHeadConfigListRepo(body);
}

async function getPayHeadDropdownService(body) {
  if (!body.ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  return await repo.getPayHeadDropdownRepo(body);
}

async function getPayHeadConfigDetailsService(body) {
  if (!body.categoryId) {
    throw new AppError("categoryId is required", 400);
  }

  if (!body.payHeadId) {
    throw new AppError("payHeadId is required", 400);
  }

  if (!body.desigId) {
    throw new AppError("desigId is required", 400);
  }

  if (!body.gradeId) {
    throw new AppError("gradeId is required", 400);
  }

  return await repo.getPayHeadConfigDetailsRepo(body);
}

async function savePayHeadConfigService(body) {
  if (!body.userId) {
    throw new AppError("userId is required", 400);
  }

  if (!body.payHeadId) {
    throw new AppError("payHeadId is required", 400);
  }

  if (!body.calcType) {
    throw new AppError("calcType is required", 400);
  }

  if (body.value === undefined || body.value === null) {
    throw new AppError("value is required", 400);
  }

  if (!body.mode) {
    throw new AppError("mode is required", 400);
  }

  if (!body.ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  const result = await repo.savePayHeadConfigRepo(body);

  if (!result.success) {
    throw new AppError(result.error, 400);
  }

  if (result.errorCode < 0 && result.errorCode !== -100) {
    throw new AppError(result.errorMsg, 400);
  }

  return result;
}

module.exports = {
  getPayHeadListService,
  getPayHeadConfigListService,
  getPayHeadDropdownService,
  getPayHeadConfigDetailsService,
  savePayHeadConfigService,
};
