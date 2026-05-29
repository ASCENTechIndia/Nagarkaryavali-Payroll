const repo = require("./FrmPayCommissionListMst.repo");
const { AppError } = require("../../../libs/errors");

// ✅ Get Pay Commission List Service
async function getPayCommissionListService() {
  return await repo.getPayCommissionListRepo();
}


// ✅ Get Pay Commission Details By Id Service
async function getPayCommissionByIdService(body) {
  if (!body.paycommid) {
    throw new AppError("paycommid is required", 400);
  }

  return await repo.getPayCommissionByIdRepo(body);
}

// ✅ Save / Update Pay Commission Service
async function savePayCommissionService(body) {
  if (!body.userId) {
    throw new AppError("userId is required", 400);
  }

  if (!body.paycName) {
    throw new AppError("Pay Commission Name is required", 400);
  }

  if (!body.paycCode) {
    throw new AppError("Pay Commission Code is required", 400);
  }

  if (!body.paycflag) {
    throw new AppError("Pay Commission Flag is required", 400);
  }

  if (!body.mode) {
    throw new AppError("mode is required", 400);
  }

  const result = await repo.savePayCommissionRepo(body);

  if (!result.success) {
    throw new AppError(result.error, 400);
  }

  if (result.errorCode < 0 && result.errorCode !== -100) {
    throw new AppError(result.errorMsg, 400);
  }

  return result;
}

module.exports = {
  getPayCommissionListService,
  getPayCommissionByIdService,
  savePayCommissionService,
};
