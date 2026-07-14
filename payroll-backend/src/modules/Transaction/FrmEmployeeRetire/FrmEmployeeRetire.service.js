const repo = require("./FrmEmployeeRetire.repo");

async function getRetirementReasonService() {
    const data = await repo.getRetirementReasonRepo();
    return {
        success: true,
        count: data.length,
        data
    };
}

async function getDepartmentService({ ulbid }) {
    if (!ulbid) {
        throw new Error("ulbid is required");
    }
    
    const data = await repo.getDepartmentRepo({ ulbid });
    return {
        success: true,
        count: data.length,
        data
    };
}

async function getSubDepartmentService({ ulbid, deptId }) {
    if (!ulbid) {
        throw new Error("ulbid is required");
    }
    if (!deptId || deptId === "0") {
        throw new Error("Department ID is required");
    }
    
    const data = await repo.getSubDepartmentRepo({ ulbid, deptId });
    return {
        success: true,
        count: data.length,
        data
    };
}

async function getEmployeeListService({ ulbid, deptId, subDeptId }) {
    if (!ulbid) {
        throw new Error("ulbid is required");
    }
    
    const data = await repo.getEmployeeListRepo({ ulbid, deptId, subDeptId });
    return {
        success: true,
        count: data.length,
        data
    };
}

async function saveRetirementService({
    userId,
    empId,
    deptId,
    subDeptId,
    reasonId,
    othReason,
    retireDate,
    ulbid,
    remark,
    blobData
}) {
    if (!userId) {
        throw new Error("userId is required");
    }
    if (!ulbid) {
        throw new Error("ulbid is required");
    }
    if (!empId || empId === "0" || empId === "-1") {
        throw new Error("Please select Employee");
    }
    if (!deptId || deptId === "0" || deptId === "-1") {
        throw new Error("Please select Department");
    }
    if (!reasonId || reasonId === "0" || reasonId === "-1") {
        throw new Error("Please select Retirement Reason");
    }
    if (!retireDate) {
        throw new Error("Please enter Retirement Date");
    }
    
    if (reasonId === "4" && (!othReason || othReason.trim() === "")) {
        throw new Error("Please specify Other Reason");
    }
    
    const result = await repo.saveRetirementRepo({
        userId,
        empId,
        deptId,
        subDeptId,
        reasonId,
        othReason,
        retireDate,
        ulbid,
        remark
    });
    
    if (result.errorCode === 9999 && blobData) {
        await repo.updateBlobImageRepo({
            retirementId: result.outId,
            ulbid,
            blobData
        });
    }
    
    if (result.errorCode === 9999) {
        return {
            success: true,
            errorCode: result.errorCode,
            outId: result.outId,
            message: result.errorMsg || "Employee retired successfully"
        };
    } else {
        return {
            success: false,
            errorCode: result.errorCode,
            message: result.errorMsg || "Operation failed"
        };
    }
}

module.exports = {
    getRetirementReasonService,
    getDepartmentService,
    getSubDepartmentService,
    getEmployeeListService,
    saveRetirementService
};