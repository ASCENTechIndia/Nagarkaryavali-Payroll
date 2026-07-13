const repo = require("./FrmEmpTransferApproval.repo");

async function getEmpTransferListService(payload) {
    if (!payload.ulbid) throw new Error("ulbid is required");

    const data = await repo.getEmpTransferListRepo(payload.ulbid);
    return { success: true, count: data.length, data };
}

async function getTransferTypesService() {
    const data = await repo.getTransferTypesRepo();
    return { success: true, count: data.length, data };
}

async function getEmpTransferDetailsService(payload) {
    if (!payload.empId || !payload.empTransId) {
        throw new Error("empId and empTransId are required");
    }
    const data = await repo.getEmpTransferDetailsRepo(payload);
    return { success: true, data };
}

async function saveEmpTransferService(payload) {
    if (!payload.userId || !payload.ulbid) throw new Error("userId and ulbid are required");

    const result = await repo.saveEmpTransferRepo(payload);
    if (result.errorCode === 9999) {
        return {
            success: true,
            errorCode: result.errorCode,
            errorMsg: result.errorMsg,
            transferId: result.transferId
        };
    }

    return {
        success: false,
        errorCode: result.errorCode,
        errorMsg: result.errorMsg,
        transferId: result.transferId
    };
}

module.exports = {
    getEmpTransferListService,
    getTransferTypesService,
    getEmpTransferDetailsService,
    saveEmpTransferService,
};
