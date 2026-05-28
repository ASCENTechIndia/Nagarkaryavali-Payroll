const repo = require("./FrmBranchMstList.repo");

const { AppError } = require("../../../libs/errors");



async function getBankListService(payload) {

  const data =
    await repo.getBankListRepo(payload);

  return {

    success: true,

    count: data.length,

    data

  };
}



async function getBranchListService(payload) {

  if (!payload.bankId) {

    throw new AppError(
      "Bank ID is required",
      400
    );
  }

  const data =
    await repo.getBranchListRepo(payload);

  return {

    success: true,

    count: data.length,

    data

  };
}



async function getBranchByIdService(payload) {

  if (!payload.branchId) {

    throw new AppError(
      "Branch ID is required",
      400
    );
  }

  const data =
    await repo.getBranchByIdRepo(payload);

  return {

    success: true,

    count: data.length,

    data

  };
}



async function saveBranchService(branchData) {

 
  if (!branchData.bankId) {

    throw new AppError(
      "Bank ID is required",
      400
    );
  }

  if (!branchData.branchName) {

    throw new AppError(
      "Branch Name is required",
      400
    );
  }

  if (!branchData.userId) {

    throw new AppError(
      "User ID is required",
      400
    );
  }

  const result =
    await repo.insertBranchRepo({

  

      bankId: branchData.bankId,

      branchId: branchData.branchId,

      branchName: branchData.branchName,

      userId: branchData.userId,

      mode: branchData.mode || 1

    });

  if (!result.success) {

    throw new AppError(
      result.error,
      500
    );
  }

  if (result.errorCode !== -100) {

    throw new AppError(
      result.errorMsg ||
      "Failed to save branch",
      500
    );
  }

  return {

    success: true,

    errorCode: result.errorCode,

    errorMsg: result.errorMsg,

    message:
      "Branch saved successfully"

  };
}

module.exports = {
  getBankListService,
  getBranchListService,
  getBranchByIdService,
  saveBranchService
};