const repo = require("./FrmEmpLeaveList.repo");

const { AppError } = require("../../../libs/errors");


async function getEmployeeLeaveBalanceService(
  payload
) {

  if (!payload.ulbId) {

    throw new AppError(
      "ULB ID is required",
      400
    );
  }

  const data =
    await repo.getEmployeeLeaveBalanceRepo(
      payload
    );

  return {

    success: true,

    count: data.length,

    data

  };
}

async function saveEmployeeLeaveBalanceService(
  data
) {

  if (!data.userId) {

    throw new AppError(
      "User ID is required",
      400
    );
  }

  if (!data.ulbId) {

    throw new AppError(
      "ULB ID is required",
      400
    );
  }

  if (!data.str) {

    throw new AppError(
      "String data is required",
      400
    );
  }

  const result =
    await repo.saveEmployeeLeaveBalanceRepo(
      data
    );

  if (!result.success) {

    throw new AppError(
      result.error,
      500
    );
  }

  if (result.errorCode !== -100) {

    throw new AppError(
      result.errorMsg,
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
  getEmployeeLeaveBalanceService,
  saveEmployeeLeaveBalanceService
};