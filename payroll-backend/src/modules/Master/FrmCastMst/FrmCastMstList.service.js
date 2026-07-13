const repo = require("./FrmCastMstList.repo");

const { AppError } = require("../../../libs/errors");

// ============================================
// GET CAST LIST
// ============================================

async function getCastListService() {

  console.log(
    "📥 Service: Fetch Cast List"
  );

  const data =
    await repo.getCastListRepo();

  return {
    success: true,
    count: data.length,
    data,
  };
}

// ============================================
// GET CAST BY ID
// ============================================

async function getCastByIdService(payload) {

  console.log(
    "📥 Service: Fetch Cast By ID",
    payload
  );

  const data =
    await repo.getCastByIdRepo(payload);

  return {
    success: true,
    count: data.length,
    data,
  };
}

// ============================================
// SAVE CAST
// ============================================

async function saveCastService(castData) {

  if (!castData.castName) {
    throw new AppError(
      "Cast Name is required",
      400
    );
  }

  if (!castData.userId) {
    throw new AppError(
      "User ID is required",
      400
    );
  }

  const result =
    await repo.insertCastRepo({

      corpId: castData.corpId || 1,

      castId: castData.castId || 0,

      castName: castData.castName,

      userId: castData.userId,

      mode: castData.mode || 1,

    });

  console.log( "Service insertCastRepo Result:", result);

  if (!result.success) {
    throw new AppError(
      result.error,
      500
    );
  }

  if (result.errorCode !== -100) {
    throw new AppError(
      result.errorMsg ||
      "Failed to save cast",
      500
    );
  }

  return {
    success: true,

    errorCode: result.errorCode,

    errorMsg: result.errorMsg,

    message: "Cast saved successfully",
  };
}

module.exports = {
  getCastListService,
  getCastByIdService,
  saveCastService,
};