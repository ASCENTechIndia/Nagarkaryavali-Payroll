const repo = require("./FrmESevaEmpLeaveRecord.repo");

const getESevaEmpLeaveRecordService = async (ulbId, empId, esevaEmpId) => {
  return await repo.getESevaEmpLeaveRecordRepo(ulbId, empId, esevaEmpId);
};

const getLeaveTakenAndEarnedService = async (ulbId, empId, esevaEmpId) => {
  return await repo.getLeaveTakenAndEarnedRepo(ulbId, empId, esevaEmpId);
};

const getLeaveDetails2Service = async (ulbId, empId, esevaEmpId) => {
  return await repo.getLeaveDetails2Repo(ulbId, empId, esevaEmpId);
};

const getFinalLeaveDetailsService = async (ulbId, empId, esevaEmpId) => {
  return await repo.getFinalLeaveDetailsRepo(ulbId, empId, esevaEmpId);
};

const getLeaveAvailabilityService = async (
    ulbId,
    empId,
    esevaEmpId
) => {
    return await repo.getLeaveAvailabilityRepo(
        ulbId,
        empId,
        esevaEmpId
    );
};

async function insertLeaveRecordService(payload) {
    if (!payload.userId) {
        throw new Error("userId is required");
    }

    if (!payload.mode) {
        throw new Error("mode is required");
    }

    if (!payload.empId) {
        throw new Error("empId is required");
    }

    if (!payload.ulbId) {
        throw new Error("ulbId is required");
    }

    if (!payload.esevaEmpId) {
        throw new Error("esevaEmpId is required");
    }

    const result = await repo.insertLeaveRecordRepo(payload);

    if (result.errorCode === 9999) {
        return {
            success: true,
            errorCode: result.errorCode,
            errorMsg: result.errorMsg
        };
    }

    return {
        success: false,
        errorCode: result.errorCode,
        errorMsg: result.errorMsg
    };
}



module.exports = {
  getESevaEmpLeaveRecordService,
  getLeaveTakenAndEarnedService,
  getLeaveDetails2Service,
  getFinalLeaveDetailsService,
  getLeaveAvailabilityService,
  insertLeaveRecordService
};
