const repo = require("./FrmSalaryCalulation.repo");

async function getCategoryService({ ulbid }) {
    const data = await repo.getCategoryRepo({ ulbid });
    return {
        success: true,
        count: data.length,
        data
    };
}

async function getDepartmentService({ ulbid }) {
    const data = await repo.getDepartmentRepo({ ulbid });
    return {
        success: true,
        count: data.length,
        data
    };
}

async function getEmployeeSalaryListService(payload) {
    const data = await repo.getEmployeeSalaryListRepo(payload);
    return {
        success: true,
        count: data.length,
        data
    };
}

async function getSubDepartmentService({ deptId, ulbid }) {
    const data = await repo.getSubDepartmentRepo({ deptId, ulbid });
    return {
        success: true,
        count: data.length,
        data
    };
}

async function getEmployeeSalaryDetailService({ empId, salaryDate, ulbid }) {
    const data = await repo.getEmployeeSalaryDetailRepo({ empId, salaryDate, ulbid });
    return {
        success: true,
        count: data.length,
        data
    };
}

async function getSalaryEarningService({ empId, salaryDate, ulbid }) {
    const data = await repo.getSalaryEarningRepo({ empId, salaryDate, ulbid });
    return {
        success: true,
        count: data.length,
        data
    };
}

async function getSalaryDeductionService({ empId, salaryDate, ulbid }) {
    const data = await repo.getSalaryDeductionRepo({ empId, salaryDate, ulbid });
    return {
        success: true,
        count: data.length,
        data
    };
}

async function getBillNoService({ ulbid, deptId, subdeptId }) {
    const data = await repo.getBillNoRepo({ ulbid, deptId, subdeptId });
    return {
        success: true,
        count: data.length,
        data
    };
}

async function saveSalaryEditService(payload) {
    const result = await repo.saveSalaryEditRepo(payload);
    return {
        success: result.errorCode !== -100,
        errorCode: result.errorCode,
        message: result.errorMsg
    };
}

module.exports = {
    getCategoryService,
    getDepartmentService,
    getEmployeeSalaryListService,
    getSubDepartmentService,
    getEmployeeSalaryDetailService,
    getSalaryEarningService,
    getSalaryDeductionService,
    getBillNoService,
    saveSalaryEditService
};