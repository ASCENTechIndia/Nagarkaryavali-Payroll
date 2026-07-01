const repo = require("./FrmEsevaReport.repo");

async function searchEmployeeService({ ulbId, empCode }) {
  if (!ulbId) throw new Error("ulbId is required");
  if (isNaN(ulbId)) throw new Error("ulbId must be a number");
  if (!empCode) throw new Error("empCode is required");

  const data = await repo.searchEmployeeRepo({ ulbId, empCode });

  if (!data || data.length === 0) {
    throw new Error("Record not found");
  }

  return {
    success: true,
    count: data.length,
    data: data[0]
  };
}

async function getCompleteEsevaReportService({ ulbId, empCode, userId, userName, corporationName }) {
  // Special ULBs
  const isSpecialUlb = [751, 1690, 870].includes(Number(ulbId));
  const isSMKC = [751, 1690].includes(Number(ulbId));

  // 1. Personal Information
  const personalInfo = await repo.getPersonalInfoRepo({ ulbId, empCode, isSpecialUlb });

  if (!personalInfo || personalInfo.length === 0) {
    throw new Error("Employee not found");
  }

  // 2. Address Details
  const addressDetails = await repo.getAddressDetailsRepo({ ulbId, empCode });

  // 3. Emergency Contact Details
  const emergencyDetails = await repo.getEmergencyDetailsRepo({ ulbId, empCode });

  // 4. Family Details
  const familyDetails = await repo.getFamilyDetailsRepo({ ulbId, empCode });

  // 5. Education Details
  const educationDetails = await repo.getEducationDetailsRepo({ ulbId, empCode });

  // 6. Additional Training
  const additionalTraining = await repo.getAdditionalTrainingRepo({ ulbId, empCode });

  // 7. PT Training
  const ptTraining = await repo.getPTTrainingRepo({ ulbId, empCode });

  // 8. Training (for SMKC)
  let training = [];
  if (isSpecialUlb) {
    training = await repo.getTrainingRepo({ ulbId, empCode });
  }

  // 9. Nomination Details
  const nominationDetails = await repo.getNominationDetailsRepo({ ulbId, empCode, isSMKC });

  // 10. Posting Records
  const postingRecords = await repo.getPostingRecordsRepo({ ulbId, empCode });

  // 11. Leave Records
  const leaveRecords = await repo.getLeaveRecordsRepo({ ulbId, empCode });

  // 12. Loan & Advance Records
  const loanAdvanceRecords = await repo.getLoanAdvanceRecordsRepo({ ulbId, empCode });

  // 13. Appendix
  const appendix = await repo.getAppendixRepo({ ulbId, empCode });

  return {
    personalInfo: personalInfo[0],
    addressDetails: addressDetails[0] || {},
    emergencyDetails: emergencyDetails[0] || {},
    familyDetails: familyDetails,
    educationDetails: educationDetails,
    additionalTraining: additionalTraining,
    ptTraining: ptTraining,
    training: training,
    nominationDetails: nominationDetails,
    postingRecords: postingRecords,
    leaveRecords: leaveRecords,
    loanAdvanceRecords: loanAdvanceRecords,
    appendix: appendix,
    isSpecialUlb,
    isSMKC
  };
}

module.exports = {
  searchEmployeeService,
  getCompleteEsevaReportService
};