const repo = require("./FrmOtherEarnEntryList.repo");

async function getEarningHeadListService({ ulbid }) {
    if (!ulbid) {
        throw new Error("ulbid is required");
    }
    
    const data = await repo.getEarningHeadListRepo({ ulbid });
    return {
        success: true,
        count: data.length,
        data
    };
}

async function getEmployeeListService({ ulbid, deptId, desgnId }) {
    if (!ulbid) {
        throw new Error("ulbid is required");
    }
    
    const data = await repo.getEmployeeListRepo({ ulbid, deptId, desgnId });
    return {
        success: true,
        count: data.length,
        data
    };
}

async function getEmployeeDetailsService({ ulbid, empId }) {
    if (!ulbid) {
        throw new Error("ulbid is required");
    }
    if (!empId || empId === "0") {
        throw new Error("Employee ID is required");
    }
    
    const data = await repo.getEmployeeDetailsRepo({ ulbid, empId });
    
    if (data.length === 0) {
        throw new Error("Employee not found");
    }
    
    return {
        success: true,
        data: data[0]
    };
}

async function getOtherEarningListService() {
    const data = await repo.getOtherEarningListRepo();
    
    return {
        success: true,
        count: data.length,
        data
    };
}

async function getEditRecordService({ ulbid, empId, detId }) {
    if (!ulbid) {
        throw new Error("ulbid is required");
    }
    if (!empId || empId === "0") {
        throw new Error("Employee ID is required");
    }
    if (!detId || detId === "0") {
        throw new Error("Record ID is required");
    }
    
    const data = await repo.getEditRecordRepo({ ulbid, empId, detId });
    
    if (data.length === 0) {
        throw new Error("Record not found");
    }
    
    return {
        success: true,
        data: data[0]
    };
}

async function saveOtherEarningService({
    userId,
    empId,
    earnId,
    payheadId,
    amount,
    ulbid,
    deptId,
    desigId,
    amtDate,
    remark,
    mode
}) {
    if (!userId) {
        throw new Error("userId is required");
    }
    if (!ulbid) {
        throw new Error("ulbid is required");
    }
    if (!empId || empId === "0") {
        throw new Error("Please select Employee");
    }
    if (!deptId || deptId === "0") {
        throw new Error("Please select Department");
    }
    if (!desigId || desigId === "0") {
        throw new Error("Please select Designation");
    }
    if (!payheadId || payheadId === "0") {
        throw new Error("Please select Earning Head");
    }
    if (!amtDate) {
        throw new Error("Please select Date");
    }
    if (!remark || remark.trim() === "") {
        throw new Error("Please enter Remark");
    }
    if (!amount || parseFloat(amount) === 0) {
        throw new Error("Please enter Amount");
    }
    if (!mode || (mode !== 1 && mode !== 2)) {
        throw new Error("Invalid mode. Mode must be 1 (Insert) or 2 (Update)");
    }
    
    if (mode === 2 && (!earnId || earnId === "0")) {
        throw new Error("Earning ID is required for update");
    }
    
    const result = await repo.saveOtherEarningRepo({
        userId,
        empId,
        earnId: mode === 1 ? 0 : earnId,
        payheadId,
        amount,
        ulbid,
        deptId,
        desigId,
        amtDate,
        remark,
        mode
    });
    
    if (result.errorCode === 9999) {
        return {
            success: true,
            errorCode: result.errorCode,
            message: result.errorMsg || (mode === 1 ? "Record inserted successfully" : "Record updated successfully")
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
    getEarningHeadListService,
    getEmployeeListService,
    getEmployeeDetailsService,
    getOtherEarningListService,
    getEditRecordService,
    saveOtherEarningService
};