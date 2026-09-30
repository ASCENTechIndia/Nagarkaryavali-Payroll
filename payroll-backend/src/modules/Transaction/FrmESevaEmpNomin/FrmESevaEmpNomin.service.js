const repo = require("./FrmESevaEmpNomin.repo");

async function getAccountHeadDropdownService() {
    const result = await repo.getAccountHeadDropdownRepo();
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getNominationDataService({ ulbid, empId, esevaEmpId }) {
    if (!ulbid) throw new Error("ulbid is required");
    if (!empId) throw new Error("empId is required");
    if (!esevaEmpId) throw new Error("esevaEmpId is required");
    const result = await repo.getNominationDataRepo({ ulbid, empId, esevaEmpId });
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function insertNominationService(payload) {
    if (!payload.ulbid) throw new Error("ulbid is required");
    if (!payload.empid) throw new Error("empid is required");
    if (!payload.esevaempid) throw new Error("esevaempid is required");
    if (!payload.STR || payload.STR.length === 0) {
        throw new Error("Please Add At least One Nominee Information");
    }

    const result = await repo.insertNominationRepo(payload);

    if (result.errorCode === 9999) {
        return {
            success: true,
            errorCode: result.errorCode,
            message: result.errorMsg || "Nomination saved successfully"
        };
    } else {
        return {
            success: false,
            errorCode: result.errorCode,
            message: result.errorMsg
        };
    }
}

module.exports = {
    getAccountHeadDropdownService,
    getNominationDataService,
    insertNominationService
};