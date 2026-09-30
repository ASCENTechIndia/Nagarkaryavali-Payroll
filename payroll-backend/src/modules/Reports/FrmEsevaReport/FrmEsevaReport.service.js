const { AppError } = require("../../../libs/errors");
const repo = require("./FrmEsevaReport.repo");

async function searchEmployeeService({ ulbId, empCode }) {
  if (!ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  if (!empCode || String(empCode).trim() === "") {
    throw new AppError("Employee code is required", 400);
  }

  const data = await repo.searchEmployeeRepo({
    ulbId,
    empCode: String(empCode).trim(),
  });

  if (!data || data.length === 0) {
    throw new AppError("Employee record not found", 404);
  }

  return {
    success: true,
    count: data.length,
    data: data[0],
  };
}

async function getCompleteEsevaReportService({
  ulbId,
  empCode,
  corporationName,
  brNameMar,
  brAddMar,
  userId,
  userName,
}) {
  if (!ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  if (!empCode || String(empCode).trim() === "") {
    throw new AppError("Employee code is required", 400);
  }

  const cleanEmpCode = String(empCode).trim();
  const numericUlbId = Number(ulbId);

  const isSpecialUlb = [751, 1690, 870].includes(numericUlbId);
  const isSMKC = [751, 1690].includes(numericUlbId);

  const employeeRows = await repo.searchEmployeeRepo({
    ulbId,
    empCode: cleanEmpCode,
  });

  if (!employeeRows || employeeRows.length === 0) {
    throw new AppError("Employee record not found", 404);
  }

  const employee = employeeRows[0];

  const resolvedEmpCode =
    employee.EMPCODE ??
    employee.empcode ??
    employee.EmpCode ??
    cleanEmpCode;

  const [
    personalInfo,
    addressDetails,
    emergencyDetails,
    familyDetails,
    education,
    additionalTraining,
    ptTraining,
    nomination,
    posting,
    leaveDetails,
    loanDetails,
    appendix,
  ] = await Promise.all([
    repo.getPersonalInfoRepo({
      ulbId,
      empCode: resolvedEmpCode,
      isSpecialUlb,
    }),

    repo.getAddressDetailsRepo({
      ulbId,
      empCode: resolvedEmpCode,
    }),

    repo.getEmergencyDetailsRepo({
      ulbId,
      empCode: resolvedEmpCode,
    }),

    repo.getFamilyDetailsRepo({
      ulbId,
      empCode: resolvedEmpCode,
    }),

    repo.getEducationDetailsRepo({
      ulbId,
      empCode: resolvedEmpCode,
    }),

    repo.getAdditionalTrainingRepo({
      ulbId,
      empCode: resolvedEmpCode,
    }),

    repo.getPTTrainingRepo({
      ulbId,
      empCode: resolvedEmpCode,
    }),

    repo.getNominationDetailsRepo({
      ulbId,
      empCode: resolvedEmpCode,
      isSMKC,
    }),

    repo.getPostingRecordsRepo({
      ulbId,
      empCode: resolvedEmpCode,
    }),

    repo.getLeaveRecordsRepo({
      ulbId,
      empCode: resolvedEmpCode,
    }),

    repo.getLoanAdvanceRecordsRepo({
      ulbId,
      empCode: resolvedEmpCode,
    }),

    repo.getAppendixRepo({
      ulbId,
      empCode: resolvedEmpCode,
    }),
  ]);

  let training = [];

  if (isSpecialUlb) {
    training = await repo.getTrainingRepo({
      ulbId,
      empCode: resolvedEmpCode,
    });
  }

  return {
    ulbId,
    resolvedEmpCode,

    personalInfo: personalInfo?.[0] || employee,

    addressDetails: addressDetails || [],

    emergencyDetails: emergencyDetails || [],

    familyDetails: familyDetails || [],

    education: education || [],

    additionalTraining: additionalTraining || [],

    ptTraining: ptTraining || [],

    training: training || [],

    nomination: nomination || [],

    posting: posting || {
      esevaInfo: {},
      previousService: [],
      foreignService: [],
      verifiedService: [],
    },

    leaveDetails: leaveDetails || {
      earnedLeave: [],
      earnedLeaveHPL: [],
      leaveAvail: [],
      leaveAvailHPL: [],
      casualLeave: [],
      extraOrdinaryLeave: [],
      commutedLeave: [],
      maternityLeave: [],
      paternityLeave: [],
      otherLeave: [],
      ltaLeave: [],
    },

    loanDetails: loanDetails || {
      interestBearingAdvances: [],
      interestBearingAdvanceInstallments: [],
    },

    appendix: appendix || [],

    corporationName: corporationName || "",
    brNameMar: brNameMar || "",
    brAddMar: brAddMar || "",
    userId: userId || "",
    userName: userName || "",
  };
}

module.exports = {
  searchEmployeeService,
  getCompleteEsevaReportService,
};