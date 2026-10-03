const repo = require("./FrmEmpLstRpt.repo");

async function getEmployeeListService({
    ulbid,
    empId,
    categoryId,
    deptId,
    desigId,
    gender,
    empStatus
}) {
    if (!ulbid) {
        throw new Error("ULB ID is required");
    }

    if (!categoryId || categoryId === "0") {
        throw new Error("Please select Category");
    }

    if (!gender) {
        throw new Error("Please select Gender");
    }

    if (!empStatus) {
        throw new Error("Please select Employee Status");
    }

    const data = await repo.getEmployeeListRepo({
        ulbid,
        empId,
        categoryId,
        deptId,
        desigId,
        gender,
        empStatus
    });

    if (!data || data.length === 0) {
        throw new Error("Record not Found");
    }

    return {
        success: true,
        count: data.length,
        data
    };
}

async function getSalaryDetailService({ lstdate, ulbid, deptId, gender }) {
    if (!lstdate) throw new Error("Salary Date is required");
    if (!ulbid) throw new Error("ULB ID is required");
    if (!deptId) throw new Error("Department ID is required");

    const result = await repo.getSalaryDetailRepo({
        lstdate,
        ulbid,
        deptId,
        gender
    });

    if (!result || !result.rows || result.rows.length === 0) {
        throw new Error("Record not Found");
    }

    return {
        success: true,
        count: result.rows.length,
        netEarning: result.netEarning,
        data: result.rows
    };
}

async function getEmployeeSubDetailService({ lstdate, ulbid, deptId, gender }) {
    if (!lstdate) throw new Error("Salary Date is required");
    if (!ulbid) throw new Error("ULB ID is required");
    if (!deptId) throw new Error("Department ID is required");

    const data = await repo.getEmployeeSubDetailRepo({
        lstdate,
        ulbid,
        deptId,
        gender
    });

    if (!data || data.length === 0) throw new Error("Record not Found");

    return {
        success: true,
        count: data.length,
        data
    };
}

async function getPayheadSalaryDetailService({ lstdate, ulbid, deptId, gender }) {
    if (!lstdate) throw new Error("Salary Date is required");
    if (!ulbid) throw new Error("ULB ID is required");
    if (!deptId) throw new Error("Department ID is required");
    if (String(deptId) === "406" && !gender) throw new Error("Gender is required");

    const data = await repo.getPayheadSalaryDetailRepo({
        lstdate,
        ulbid,
        deptId,
        gender
    });

    if (!data || data.length === 0) throw new Error("Record not Found");

    return {
        success: true,
        count: data.length,
        data
    };
}
module.exports = {
    getEmployeeListService,
    getSalaryDetailService,
    getEmployeeSubDetailService,
    getPayheadSalaryDetailService
};