const repo = require("./FrmESevaEmpEducationalInformation.repo");

async function getEducationalInfoService({ ulbid, empId, esevaEmpId }) {
    if (!ulbid) throw new Error("ulbid is required");
    if (!empId) throw new Error("empId is required");
    if (!esevaEmpId) throw new Error("esevaEmpId is required");
    const result = await repo.getEducationalInfoRepo({ ulbid, empId, esevaEmpId });
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getAdditionalTrainingService({ ulbid, empId, esevaEmpId }) {
    if (!ulbid) throw new Error("ulbid is required");
    if (!empId) throw new Error("empId is required");
    if (!esevaEmpId) throw new Error("esevaEmpId is required");
    const result = await repo.getAdditionalTrainingRepo({ ulbid, empId, esevaEmpId });
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getProfessionalTrainingService({ ulbid, empId, esevaEmpId }) {
    if (!ulbid) throw new Error("ulbid is required");
    if (!empId) throw new Error("empId is required");
    if (!esevaEmpId) throw new Error("esevaEmpId is required");
    const result = await repo.getProfessionalTrainingRepo({ ulbid, empId, esevaEmpId });
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function insertEducationalInfoService(payload) {
    if (!payload.ulbid) throw new Error("ulbid is required");
    if (!payload.empid) throw new Error("empid is required");
    if (!payload.esevaempid) throw new Error("esevaempid is required");
    if (!payload.STR || payload.STR.length === 0) {
        throw new Error("Please Add At least One Educational Information");
    }

    const result = await repo.insertEducationalInfoRepo(payload);

    if (result.errorCode === 9999) {
        return {
            success: true,
            errorCode: result.errorCode,
            message: result.errorMsg || "Educational information saved successfully"
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
    getEducationalInfoService,
    getAdditionalTrainingService,
    getProfessionalTrainingService,
    insertEducationalInfoService
};