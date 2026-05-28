const repo = require("./FrmLeaveApplicationList.repo");

const { AppError } = require("../../../libs/errors");


async function getLeaveListService(payload) {

  if (!payload.ulbId) {

    throw new AppError(
      "ULB ID is required",
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


async function getDepartmentListService() {

  const data =
    await repo.getDepartmentListRepo();

  return {

    success: true,

    count: data.length,

    data

  };
}



async function getDesignationListService() {

  const data =
    await repo.getDesignationListRepo();

  return {

    success: true,

    count: data.length,

    data

  };
}


async function getEmployeeListService(payload) {

  if (!payload.ulbId) {

    throw new AppError(
      "ULB ID is required",
      400
    );
  }

  const data =
    await repo.getEmployeeListRepo(payload);

  return {

    success: true,

    count: data.length,

    data

  };
}



async function getEmployeeDetailsService(payload) {

  if (!payload.ulbId) {

    throw new AppError(
      "ULB ID is required",
      400
    );
  }

  if (!payload.employeeId) {

    throw new AppError(
      "Employee ID is required",
      400
    );
  }

  const data =
    await repo.getEmployeeDetailsRepo(payload);

  return {

    success: true,

    count: data.length,

    data

  };
}


async function getPendingLeaveService(payload) {

  if (!payload.ulbId) {

    throw new AppError(
      "ULB ID is required",
      400
    );
  }

  if (!payload.employeeId) {

    throw new AppError(
      "Employee ID is required",
      400
    );
  }

  const data =
    await repo.getPendingLeaveRepo(payload);

  return {

    success: true,

    count: data.length,

    data

  };
}


async function getEmployeeLeaveSummaryService(payload) {

  if (!payload.ulbId) {

    throw new AppError(
      "ULB ID is required",
      400
    );
  }

  if (!payload.employeeId) {

    throw new AppError(
      "Employee ID is required",
      400
    );
  }

  const data =
    await repo.getEmployeeLeaveSummaryRepo(payload);

  return {

    success: true,

    count: data.length,

    data

  };
}


async function getEmployeeLeaveBalanceService(payload) {

  if (!payload.employeeId) {

    throw new AppError(
      "Employee ID is required",
      400
    );
  }

  if (!payload.leaveTypeId) {

    throw new AppError(
      "Leave Type ID is required",
      400
    );
  }

  if (!payload.ulbId) {

    throw new AppError(
      "ULB ID is required",
      400
    );
  }

  const data =
    await repo.getEmployeeLeaveBalanceRepo(payload);

  return {

    success: true,

    count: data.length,

    data

  };
}


async function saveEmployeeLeaveService(data) {

  if (!data.userId) {

    throw new AppError(
      "User ID is required",
      400
    );
  }

  if (!data.empId) {

    throw new AppError(
      "Employee ID is required",
      400
    );
  }

  if (!data.leaveType) {

    throw new AppError(
      "Leave Type is required",
      400
    );
  }

  if (!data.fromDate) {

    throw new AppError(
      "From Date is required",
      400
    );
  }

  if (!data.toDate) {

    throw new AppError(
      "To Date is required",
      400
    );
  }

  const result =
    await repo.saveEmployeeLeaveRepo(data);

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

    errorCode: result.errorCode,

    errorMsg: result.errorMsg,

    message: result.errorMsg

  };
}

module.exports = {
  getLeaveListService,
  getDepartmentListService,
  getDesignationListService,
  getEmployeeListService,
  getEmployeeDetailsService,
  getPendingLeaveService,
  getEmployeeLeaveSummaryService,
  getEmployeeLeaveBalanceService,
  saveEmployeeLeaveService
};