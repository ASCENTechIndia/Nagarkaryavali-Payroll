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
    throw new AppError("Employee ID is required", 400);
  }

  // if (!payload.leaveTypeId) {
  //   throw new AppError("Leave Type ID is required", 400);
  // }

  if (!payload.ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const data = await repo.getEmployeeLeaveBalanceRepo(payload);
  console.log({data})
  const specialUlbs = ["751", "1690", "4", "1670"];

  // Normal ULB
  if (!specialUlbs.includes(String(payload.ulbId))) {
    return {
      success: true,
      count: data.length,
      data
    };
  }

 
  const row = data[0];

  const leaveMap = {
    "1": ["MEDLEAVE", "bMEDLEAVE"],
    "2": ["casualleave", "bcasualleave"],
    "3": ["casualleave", "bcasualleave"],
    "4": ["PL", "bPL"],
    "5": ["MEDLEAVE", "bMEDLEAVE"],
    "6": ["MetLeave1", "bMetLeave1"],
    "7": ["MetLeave2", "bMetLeave2"],
    "8": ["splleave", "bsplleave"],
    "9": ["OptionalLeave", "bOptionalLeave"],
    "10": ["adhyayan", "badhyayan"],
    "11": ["ChildCare", "bChildCare"],
    "12": ["UnexpecLeave", "bUnexpecLeave"],
    "13": ["nosaldeduct", "bnosaldeduct"],
    "14": ["SPLUnexpLeave", "bSPLUnexpLeave"],
    "15": ["HPMleave", "bHPMleave"],
    "17": ["PL", "bPL"]
  };

  const mapping = leaveMap[String(payload.leaveTypeId)];

  if (!mapping) {
    return {
      success: true,
      count: 1,
      data: [{
        allotted: 0,
        balance: 0
      }]
    };
  }

  const [allottedField, balanceField] = mapping;

  return {
    success: true,
    count: 1,
    data: [{
      allotted: Number(row[allottedField] || 0),
      balance: Number(row[balanceField] || 0)
    }]
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