const repo = require("./FrmDeptSelect.repo");
const { AppError } = require("../../../libs/errors");

async function getDeptSelectListService(body) {
  return await repo.getDeptSelectListRepo(body);
}

async function getDepartmentOrderService(body) {
  if (!body.ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  if (!body.deptId) {
    throw new AppError("deptId is required", 400);
  }

  return await repo.getDepartmentOrderRepo(body);
}

async function getDesignationListService(body) {
  if (!body.ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  return await repo.getDesignationListRepo(body);
}

async function getExistingDesignationOrderService(body) {
  if (!body.ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  if (!body.deptId) {
    throw new AppError("deptId is required", 400);
  }

  return await repo.getExistingDesignationOrderRepo(body);
}

async function saveDepartmentOrderService(body) {
  if (!body.userId) {
    throw new AppError("userId is required", 400);
  }

  if (!body.ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  if (!body.deptId) {
    throw new AppError("deptId is required", 400);
  }

  if (!body.deptOrder) {
    throw new AppError("Department Order is required", 400);
  }

  if (!body.desigStr) {
    throw new AppError("Designation String is required", 400);
  }

  const result = await repo.saveDepartmentOrderRepo(body);

  if (!result.success) {
    throw new AppError(result.error, 400);
  }

  if (
    result.errorCode < 0 &&
    result.errorCode !== -100
  ) {
    throw new AppError(result.errorMsg, 400);
  }

  return result;
}

module.exports = {
  getDeptSelectListService,
  getDepartmentOrderService,
  getDesignationListService,
  getExistingDesignationOrderService,
  saveDepartmentOrderService,
};
