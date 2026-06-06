const repo = require("./FrmAttendanceEntry.repo");

const formatDateForAPI = (year, month) => {
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const lastDay = new Date(yearNum, monthNum, 0).getDate();
    const day = lastDay.toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthAbbr = monthNames[monthNum - 1];
    
    return `${day}-${monthAbbr}-${yearNum}`;
};

async function getAttendanceListService(payload) {
    if (!payload.ulbid) {
        throw new Error("ulbid is required");
    }
    if (!payload.categoryId || payload.categoryId === "0") {
        throw new Error("Please Select Category");
    }
    if (!payload.zoneId || payload.zoneId === "0") {
        throw new Error("Please Select Zone");
    }
    if (!payload.deptId || payload.deptId === "0") {
        throw new Error("Please Select Department Name");
    }
    if (!payload.year || payload.year === "-1") {
        throw new Error("Please Select Year");
    }
    if (!payload.month || payload.month === "-1") {
        throw new Error("Please Select Month");
    }
    
    const year = parseInt(payload.year);
    const month = parseInt(payload.month);
    const daysInMonth = new Date(year, month, 0).getDate();
    const lastDate = formatDateForAPI(year, month);
    const firstDateObj = new Date(year, month - 1, 1);
    const fromDay = firstDateObj.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const fromDate = `${fromDay}-${monthNames[month - 1]}-${year}`;
    const toDate = lastDate;
    
    console.log('Formatted dates:', { lastDate, fromDate, toDate });
    
    const data = await repo.getAttendanceListRepo({
        categoryId: payload.categoryId,
        zoneId: payload.zoneId,
        deptId: payload.deptId,
        subdeptId: payload.subdeptId,
        billNo: payload.billNo,
        empId: payload.empId,
        ulbid: payload.ulbid,
        month: payload.month,
        year: payload.year,
        lastDate: lastDate,
        fromDate: fromDate,
        toDate: toDate
    });
    
    return {
        success: true,
        count: data.length,
        daysInMonth: daysInMonth,
        data
    };
}

async function saveAttendanceService(payload) {
    if (!payload.userId) {
        throw new Error("userId is required");
    }
    if (!payload.ulbId) { 
        throw new Error("ulbId is required");
    }
    if (!payload.categoryId || payload.categoryId === "0") {
        throw new Error("Please Select Category");
    }
    if (!payload.zoneId || payload.zoneId === "0") {
        throw new Error("Please Select Zone");
    }
    if (!payload.departmentId || payload.departmentId === "0") {
        throw new Error("Please Select Department Name");
    }
    if (!payload.month || payload.month === "-1") {
        throw new Error("Please Select Month");
    }
    if (!payload.year || payload.year === "-1") {
        throw new Error("Please Select Year");
    }
    if (!payload.attendanceStr || payload.attendanceStr.length === 0) {
        throw new Error("Please select at least one record to proceed");
    }
    
    const result = await repo.saveAttendanceRepo(payload);
    
    if (result.errorCode === 9999) {
        return {
            success: false,
            errorCode: result.errorCode,
            message: result.errorMsg
        };
    } else {
        return {
            success: true,
            errorCode: result.errorCode,
            message: result.errorMsg || "Attendance saved successfully"
        };
    }
}

module.exports = {
    getAttendanceListService,
    saveAttendanceService,
};