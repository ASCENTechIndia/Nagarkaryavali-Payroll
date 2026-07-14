const repo = require("./FrmPayScaleConfig.repo");
const { AppError } = require("../../../libs/errors");


async function getPayScaleListService(payload) {

  if (!payload.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const data =
    await repo.getPayScaleListRepo(payload);

  return {
    success: true,
    count: data.length,
    data
  };
}

async function getConfiguredPayScaleService(payload) {

  if (!payload.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const data =
    await repo.getConfiguredPayScaleRepo(payload);

  return {
    success: true,
    count: data.length,
    data
  };
}

async function savePayScaleConfigurationService(
  data
) {

  if (!data.userId) {

    throw new AppError(
      "User ID is required",
      400
    );
  }

  if (!data.payScaleStr) {

    throw new AppError(
      "Pay Scale String is required",
      400
    );
  }

  const result =
    await repo.savePayScaleConfigurationRepo(
      data
    );

  if (!result.success) {

    throw new AppError(
      result.error,
      500
    );
  }

  return {

    success: true,

    errorCode:
      result.errorCode,

    errorMsg:
      result.errorMsg,

    message:
      result.errorMsg

  };
}
module.exports = {
  getPayScaleListService,
  getConfiguredPayScaleService,
  savePayScaleConfigurationService
};