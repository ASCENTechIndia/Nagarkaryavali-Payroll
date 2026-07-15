const repo = require("./FrmLeaveApprovalList.repo");

const { AppError } = require("../../../libs/errors");


async function getPendingLeaveListService(payload) {

  if (!payload.ulbId) {

    throw new AppError(
      "ULB ID is required",
      400
    );
  }

  const data =
    await repo.getPendingLeaveListRepo(
      payload
    );

  return {

    success: true,

    count: data.length,

    data

  };
}


async function getLeaveTypeListService(payload) {

  if (!payload.ulbId) {

    throw new AppError(
      "ULB ID is required",
      400
    );
  }

  const data =
    await repo.getLeaveTypeListRepo(
      payload
    );

  return {

    success: true,

    count: data.length,

    data

  };
}


async function getLeaveApprovalDetailsService(
  payload
) {

  if (!payload.ulbId) {

    throw new AppError(
      "ULB ID is required",
      400
    );
  }

  if (!payload.leaveId) {

    throw new AppError(
      "Leave ID is required",
      400
    );
  }

  if (!payload.empCode) {

    throw new AppError(
      "Employee Code is required",
      400
    );
  }

  const data =
    await repo.getLeaveApprovalDetailsRepo(
      payload
    );

  return {

    success: true,

    count: data.length,

    data

  };
}

async function saveLeaveApprovalService(payload) {
    if (!payload.userId) {
        throw new AppError("User ID is required", 400);
    }

    if (!payload.leaveappid) {
        throw new AppError("Leave Application ID is required", 400);
    }

    if (!payload.empid) {
        throw new AppError("Employee ID is required", 400);
    }

    if (!payload.ulbid) {
        throw new AppError("ULB ID is required", 400);
    }

    if (!payload.leavestatus) {
        throw new AppError("Leave Status is required", 400);
    }

    if (!payload.remark) {
        throw new AppError("Please enter Remark", 400);
    }

    payload.mode = 3;

    const result = await repo.saveLeaveApprovalRepo(payload);

    if (!result.success) {
        throw new AppError(result.error, 400);
    }

    
    return {
        success: true,
        message: result.errorMsg || "Leave application processed successfully",
        errorCode: result.errorCode
    };
}

module.exports = {
  getPendingLeaveListService,
  getLeaveTypeListService,
  getLeaveApprovalDetailsService,
  saveLeaveApprovalService
};