const repo = require("./FrmPayrollReport.repo");

async function getMonthListService() {
    const data = await repo.getMonthListRepo();
    
    return {
        success: true,
        count: data.length,
        data
    };
}

async function getYearListService() {
    const data = await repo.getYearListRepo();
    
    return {
        success: true,
        count: data.length,
        data
    };
}

async function getPayrollReportService({
    startDate,
    endDate,
    ulbid,
    deptId,
    zoneId,
    empStatus,
    reportType
}) {
    if (!startDate) {
        throw new Error("Please select Year and Month. StartDate is required");
    }
    
    if (!endDate) {
        throw new Error("Please select Year and Month. EndDate is required");
    }
    
    if (!reportType || reportType === "0") {
        throw new Error("Please select Report Type");
    }
    
    if (!ulbid) {
        throw new Error("ulbid is required");
    }
    
    if (isNaN(ulbid)) {
        throw new Error("ulbid must be a number");
    }
    
    const dateRegex = /^\d{2}-[A-Za-z]{3}-\d{4}$/;
    if (!dateRegex.test(startDate)) {
        throw new Error("startDate must be in format DD-MMM-YYYY (e.g., 01-Jan-2024)");
    }
    if (!dateRegex.test(endDate)) {
        throw new Error("endDate must be in format DD-MMM-YYYY (e.g., 31-Jan-2024)");
    }
    
    if (deptId && deptId !== "-1" && isNaN(deptId)) {
        throw new Error("deptId must be a number");
    }
    
    if (zoneId && zoneId !== "-1" && isNaN(zoneId)) {
        throw new Error("zoneId must be a number");
    }
    
    if ((ulbid == 770 || ulbid == 1750) && empStatus && empStatus !== "-1") {
        if (!["OLD", "NEW"].includes(empStatus)) {
            throw new Error("empStatus must be either 'OLD' or 'NEW'");
        }
    }
    
    const data = await repo.getPayrollReportRepo({
        startDate,
        endDate,
        ulbid,
        deptId,
        zoneId,
        empStatus,
        reportType
    });
    
    if (!data || data.length === 0) {
        throw new Error("Record not Found");
    }
    
    let reportName = "";
    switch (reportType) {
        case "1":
            reportName = "Bank List";
            break;
        case "2":
            reportName = "Bank Deduction";
            break;
        case "4":
            reportName = "Bank Of Maharashtra List";
            break;
        case "5":
            reportName = "Bank ECS List";
            break;
    }
    
    return {
        success: true,
        count: data.length,
        data,
        reportName,
        filters: {
            startDate,
            endDate,
            ulbid,
            deptId: deptId || "-1",
            zoneId: zoneId || "-1",
            empStatus: empStatus || "-1",
            reportType
        }
    };
}

module.exports = {
    getMonthListService,
    getYearListService,
    getPayrollReportService  
};