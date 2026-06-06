const repo = require("./FrmPayrollDashbordMst.repo");

async function getDepartmentService({ ulbid }) {
    if (!ulbid) {
        throw new Error("ulbid is required");
    }
    
    if (isNaN(ulbid)) {
        throw new Error("ulbid must be a number");
    }
    
    const data = await repo.getDepartmentRepo({ ulbid });
    
    if (!data || data.length === 0) {
        throw new Error("No departments found");
    }
    
    return {
        success: true,
        count: data.length,
        data,
        message: "Departments fetched successfully"
    };
}

async function getDesignationService({ ulbid, deptid }) {
    if (!ulbid) {
        throw new Error("ulbid is required");
    }
    
    if (isNaN(ulbid)) {
        throw new Error("ulbid must be a number");
    }
    
    if (!deptid) {
        throw new Error("deptid is required");
    }
    
    const data = await repo.getDesignationRepo({ ulbid, deptid });
    
    if (!data || data.length === 0) {
        throw new Error("No designations found for this department");
    }
    
    return {
        success: true,
        count: data.length,
        data,
        message: "Designations fetched successfully"
    };
}

async function getEmployeeDetailsService({ ulbid, deptid, designationid, corpId }) {
    if (!ulbid) {
        throw new Error("ulbid is required");
    }
    
    if (isNaN(ulbid)) {
        throw new Error("ulbid must be a number");
    }
    
    if (!corpId) {
        throw new Error("corpId is required");
    }
    
    if (!deptid) {
        throw new Error("deptid is required");
    }
    
    if (!designationid) {
        throw new Error("designationid is required");
    }
    
    const data = await repo.getEmployeeDetailsRepo({ 
        ulbid, 
        deptid, 
        designationid, 
        corpId 
    });
    
    if (!data || data.length === 0) {
        throw new Error("No employees found for this designation");
    }
    
    return {
        success: true,
        count: data.length,
        data,
        message: "Employee details fetched successfully"
    };
}

module.exports = {
    getDepartmentService,
    getDesignationService,
    getEmployeeDetailsService
};