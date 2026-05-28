const repo = require("./FrmLeaveListMst.repo");

const { AppError } = require("../../../libs/errors");

// ============================================
// GET LEAVE LIST
// ============================================

async function getLeaveListService(payload) {

  if (!payload.corpId) {

    throw new AppError(
      "Corporation ID is required",
      400
    );
  }

  const data =
    await repo.getLeaveListRepo(payload);

  return {

    success: true,

    count: data.length,

    data

  };
}

// ============================================
// GET LEAVE BY ID
// ============================================

async function getLeaveByIdService(payload) {

  if (!payload.corpId) {

    throw new AppError(
      "Corporation ID is required",
      400
    );
  }

  if (!payload.leaveId) {

    throw new AppError(
      "Leave ID is required",
      400
    );
  }

  const data =
    await repo.getLeaveByIdRepo(payload);

  return {

    success: true,

    count: data.length,

    data

  };
}

// ============================================
// SAVE LEAVE
// ============================================

async function saveLeaveService(leaveData) {

  if (!leaveData.userId) {

    throw new AppError(
      "User ID is required",
      400
    );
  }

  if (!leaveData.corpId) {

    throw new AppError(
      "Corporation ID is required",
      400
    );
  }

  if (
    leaveData.mode !== 3 &&
    !leaveData.leaveName
  ) {

    throw new AppError(
      "Leave Name is required",
      400
    );
  }

  const result =
    await repo.insertLeaveRepo({

      userId: leaveData.userId,

      corpId: leaveData.corpId,

      leaveId: leaveData.leaveId || 0,

      leaveName: leaveData.leaveName || "",

      mode: leaveData.mode 

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
      "Failed to save leave",
      500
    );
  }

  return {

    success: true,

    errorCode: result.errorCode,

    errorMsg: result.errorMsg,

    message:
      result.errorMsg

  };
}

module.exports = {
  getLeaveListService,
  getLeaveByIdService,
  saveLeaveService
};