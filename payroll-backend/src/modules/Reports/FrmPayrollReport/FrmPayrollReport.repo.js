const { executeQuery } = require("../../../db/queryExecutor");

async function getMonthListRepo() {
    const sql = `
        SELECT 
            var_month_name, 
            num_month_id 
        FROM 
            admins.aoup_calendar 
        WHERE 
            1 = 1 
        ORDER BY 
            num_month_id
    `;
    
    const result = await executeQuery(sql);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getYearListRepo() {
    const sql = `
        SELECT 
            var_year, 
            num_year_id 
        FROM 
            admins.AOMA_YEAR 
        WHERE 
            1 = 1 
        ORDER BY 
            num_year_id DESC
    `;
    
    const result = await executeQuery(sql);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getPayrollReportRepo({
    startDate,
    endDate,
    ulbid,
    deptId,
    zoneId,
    empStatus,
    reportType
}) {
    let query = "";
    const binds = {};
    
    if (reportType === "1") {
        query = `
            SELECT * 
            FROM view_banklist  
            WHERE salDate BETWEEN TO_DATE(:startDate, 'DD-MON-YYYY') 
                              AND TO_DATE(:endDate, 'DD-MON-YYYY')
        `;
        binds.startDate = startDate;
        binds.endDate = endDate;
        
        query += ` AND ulbid = :ulbid`;
        binds.ulbid = ulbid;
        
        if (deptId && deptId !== "-1") {
            query += ` AND deptid = :deptId`;
            binds.deptId = deptId;
        }
        
        if (zoneId && zoneId !== "-1") {
            query += ` AND zone = :zoneId`;
            binds.zoneId = zoneId;
        }
        
        if (ulbid == 770 || ulbid == 1750) {
            if (empStatus && empStatus !== "-1") {
                query += ` AND empstatus = :empStatus`;
                binds.empStatus = empStatus;
            }
        }
        
        if (ulbid != 751) {
            query += ` ORDER BY EMPCODE`;
        }
    }
    
    else if (reportType === "2") {
        query = `
            SELECT * 
            FROM view_bankdeduction  
            WHERE salDate BETWEEN TO_DATE(:startDate, 'DD-MON-YYYY') 
                              AND TO_DATE(:endDate, 'DD-MON-YYYY')
        `;
        binds.startDate = startDate;
        binds.endDate = endDate;
        
        query += ` AND ulbid = :ulbid`;
        binds.ulbid = ulbid;
        
        if (deptId && deptId !== "-1") {
            query += ` AND deptid = :deptId`;
            binds.deptId = deptId;
        }
        
        if (zoneId && zoneId !== "-1") {
            query += ` AND zone = :zoneId`;
            binds.zoneId = zoneId;
        }
        
        if (ulbid == 770 || ulbid == 1750) {
            if (empStatus && empStatus !== "-1") {
                query += ` AND empstatus = :empStatus`;
                binds.empStatus = empStatus;
            }
        }
        
        if (ulbid != 751) {
            query += ` ORDER BY empcode`;
        }
    }
    
    else if (reportType === "4") {
        query = `
            SELECT * 
            FROM view_ecslist  
            WHERE salDate BETWEEN TO_DATE(:startDate, 'DD-MON-YYYY') 
                              AND TO_DATE(:endDate, 'DD-MON-YYYY')
            AND paymode = 'M'
        `;
        binds.startDate = startDate;
        binds.endDate = endDate;
        
        if (deptId && deptId !== "-1") {
            query += ` AND deptid = :deptId`;
            binds.deptId = deptId;
        }
        
        if (zoneId && zoneId !== "-1") {
            query += ` AND zone = :zoneId`;
            binds.zoneId = zoneId;
        }
    }
    
    else if (reportType === "5") {
        query = `
            SELECT * 
            FROM view_ecslist  
            WHERE salDate BETWEEN TO_DATE(:startDate, 'DD-MON-YYYY') 
                              AND TO_DATE(:endDate, 'DD-MON-YYYY')
            AND paymode = 'E'
        `;
        binds.startDate = startDate;
        binds.endDate = endDate;
        
        if (deptId && deptId !== "-1") {
            query += ` AND deptid = :deptId`;
            binds.deptId = deptId;
        }
        
        if (zoneId && zoneId !== "-1") {
            query += ` AND zone = :zoneId`;
            binds.zoneId = zoneId;
        }
    }
    
    else {
        throw new Error("Invalid Report Type");
    }
    
    const result = await executeQuery(query, binds);
    if (!result.success) throw new Error(result.error);
    
    return result.rows;
}

module.exports = {
    getMonthListRepo,
    getYearListRepo,
    getPayrollReportRepo
};