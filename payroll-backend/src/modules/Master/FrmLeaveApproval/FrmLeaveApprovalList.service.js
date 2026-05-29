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

module.exports = {
  getPendingLeaveListService,
  getLeaveTypeListService,
  getLeaveApprovalDetailsService
};