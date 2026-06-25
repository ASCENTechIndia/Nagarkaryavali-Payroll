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

module.exports = {
    getEmployeeListService
};