const repo = require("./FrmEsevaEmpList.repo");

async function getEmployeeStageService(payload) {
    console.log("📥 Service: Fetch Employee Stage", payload);
    const data = await repo.getEmployeeStageRepo(payload);

    return { success: true, count: data.length, data };
}

async function getEmployeeListService(payload) {
    console.log("📥 Service: Fetch Employee List", payload);
    const data = await repo.getEmployeeListRepo(payload);

    return { success: true, count: data.length, data };
}

module.exports = {
    getEmployeeStageService,
    getEmployeeListService
};