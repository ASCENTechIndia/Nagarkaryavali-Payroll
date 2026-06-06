const repo = require("./FrmEmpPayHeadListRpt.repo");

async function getEmployeeListService({ ulbid }) {
    if (!ulbid) {
        throw new Error("ulbid is required");
    }
    
    if (isNaN(ulbid)) {
        throw new Error("ulbid must be a number");
    }
    
    const data = await repo.getEmployeeListRepo({ ulbid });
    
    return {
        success: true,
        count: data.length,
        data
    };
}

async function getZoneListService({ ulbid }) {
    if (!ulbid) {
        throw new Error("ulbid is required");
    }
    
    if (isNaN(ulbid)) {
        throw new Error("ulbid must be a number");
    }
    
    const data = await repo.getZoneListRepo({ ulbid });
    
    return {
        success: true,
        count: data.length,
        data
    };
}

async function getEmployeePayHeadListService({
    ulbid,
    categoryId,
    zoneId,
    deptId,
    employeeId,
    payHeadId
}) {
    if (!ulbid) {
        throw new Error("ulbid is required");
    }
    
    if (isNaN(ulbid)) {
        throw new Error("ulbid must be a number");
    }
    
    if (!payHeadId || payHeadId === "0") {
        throw new Error("PayHead is required. Please select a valid PayHead");
    }
    
    if (isNaN(payHeadId)) {
        throw new Error("payHeadId must be a number");
    }
    
    if (categoryId && categoryId !== "-1" && isNaN(categoryId)) {
        throw new Error("categoryId must be a number");
    }
    
    if (zoneId && zoneId !== "-1" && isNaN(zoneId)) {
        throw new Error("zoneId must be a number");
    }
    
    if (deptId && deptId !== "-1" && isNaN(deptId)) {
        throw new Error("deptId must be a number");
    }
    
    if (employeeId && employeeId !== "0" && isNaN(employeeId)) {
        throw new Error("employeeId must be a number");
    }
    
    const data = await repo.getEmployeePayHeadListRepo({
        ulbid,
        categoryId,
        zoneId,
        deptId,
        employeeId,
        payHeadId
    });
    
    if (!data || data.length === 0) {
        throw new Error("No Records Found");
    }
    
    return {
        success: true,
        count: data.length,
        data,
        reportName: "Employee Wise PayHead Report",
        payHeadName: payHeadId
    };
}

module.exports = {
    getEmployeeListService,
    getZoneListService,
    getEmployeePayHeadListService
};