const repo = require("./FrmPayScaleListMst.repo");
const { AppError } = require("../../../libs/errors");

// ✅ Get PayScale List
async function getPayScaleListService(body) {
  return await repo.getPayScaleListRepo(body);
}

// ✅ Get PayScale By Id
async function getPayScaleByIdService(body) {
  if (!body.payscaleid) {
    throw new AppError("payscaleid is required", 400);
  }

  return await repo.getPayScaleByIdRepo(body);
}

// ✅ Save / Update / Delete PayScale
async function savePayScaleService(body) {
  if (!body.userId) {
    throw new AppError("userId is required", 400);
  }

  if (!body.payScale) {
    throw new AppError("PayScale is required", 400);
  }

  if (!body.mode) {
    throw new AppError("mode is required", 400);
  }

  const result = await repo.savePayScaleRepo(body);

  if (!result.success) {
    throw new AppError(result.error, 400);
  }

  if (result.errorCode < 0 && result.errorCode !== -100) {
    throw new AppError(result.errorMsg, 400);
  }

  return result;
}

module.exports = {
  getPayScaleListService,
  getPayScaleByIdService,
  savePayScaleService,
};
