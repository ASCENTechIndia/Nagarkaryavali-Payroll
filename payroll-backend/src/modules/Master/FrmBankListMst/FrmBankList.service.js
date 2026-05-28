const repo = require("./FrmBankList.repo");

const { AppError } = require("../../../libs/errors");

// ============================================
// GET BANK LIST
// ============================================

async function getBankListService(payload) {

  console.log(
    "📥 Service: Fetch Bank List",
    payload
  );

  const data =
    await repo.getBankListRepo(payload);

  return {

    success: true,

    count: data.length,

    data

  };
}

// ============================================
// GET BANK BY ID
// ============================================

async function getBankByIdService(payload) {

  console.log(
    "📥 Service: Fetch Bank By ID",
    payload
  );

  if (!payload.bankId) {

    throw new AppError(
      "Bank ID is required",
      400
    );
  }

  const data =
    await repo.getBankByIdRepo(payload);

  return {

    success: true,

    count: data.length,

    data

  };
}

// ============================================
// SAVE BANK
// ============================================

async function saveBankService(bankData) {


  if (!bankData.bankName) {

    throw new AppError(
      "Bank Name is required",
      400
    );
  }

  if (!bankData.userId) {

    throw new AppError(
      "User ID is required",
      400
    );
  }

  const result =
    await repo.insertBankRepo({

      corpId: bankData.corpId,

      bankId: bankData.bankId,

      bankName: bankData.bankName,

      userId: bankData.userId,

      mode: bankData.mode || 1

    });

  console.log(
    "Service insertBankRepo Result:",
    result
  );

  if (!result.success) {

    throw new AppError(
      result.error,
      500
    );
  }

  if (result.errorCode !== -100) {

    throw new AppError(
      result.errorMsg ||
      "Failed to save bank",
      500
    );
  }

  return {

    success: true,

    errorCode: result.errorCode,

    errorMsg: result.errorMsg,

    message:
      "Bank saved successfully"

  };
}

module.exports = {
  getBankListService,
  getBankByIdService,
  saveBankService
};