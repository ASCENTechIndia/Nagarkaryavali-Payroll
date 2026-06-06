const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");

async function getEmployeeListRepo({ ulbid }) {
    const sql = `
        SELECT 
            num_employee_empid || '-' || var_employee_engname AS EmpName, 
            num_employee_empid 
        FROM 
            aopr_employee_def 
        WHERE 
            num_employee_ulbid = :ulbid 
        ORDER BY 
            var_employee_engname
    `;
    
    const binds = { ulbid };
    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getZoneListRepo({ ulbid }) {
    const sql = `
        SELECT 
            CASE 
                WHEN (ULBID = 2 AND ZONEID = 6) THEN 'मुख्यालय' 
                ELSE ZONENAME 
            END AS ZONENAME, 
            ZONEID 
        FROM 
            vw_zoneconfig 
        WHERE 
            ulbid = :ulbid
        ORDER BY ZONENAME
    `;
    
    const binds = { ulbid };
    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getEmployeePayHeadListRepo({
    ulbid,
    categoryId,
    zoneId,
    deptId,
    employeeId,
    payHeadId
}) {
    const isSpecialUlb = (ulbid == 770 || ulbid == 1750);
    
    let sql = "";
    
    if (isSpecialUlb) {
        sql = `
            SELECT 
                num_employee_ulbid ulbid,
                var_deptslip_sequence empid,
                var_deptslip_code billno,
                var_employee_engname engname,
                var_employee_marname emp_marname,
                var_deptmst_deptnamee deptnamee,
                num_deptmst_deptid deptid,
                num_zone_id zone_id,
                var_zone_name zone_name,
                num_salarydtl_payheadid payheadid,
                SUM(NVL(num_salarydtl_amount, 0)) amount,
                num_salarydtl_payheadid num_empallowded_payheadid
            FROM 
                aopr_employee_def   
                INNER JOIN aopr_deptmst_def ON num_deptmst_deptid = num_employee_deptid   
                INNER JOIN aopr_zone_mas ON num_zone_id = num_employee_zone 
                INNER JOIN aopr_salarydtl_def ON num_salarydtl_empid = num_employee_empid 
                    AND num_salarydtl_ulbid = num_employee_ulbid  
                LEFT JOIN aopr_deptslip_mas ON num_deptslip_ulbid = num_employee_ulbid 
                    AND num_deptslip_empid = num_employee_empid 
            WHERE 
                1 = 1 
                AND num_employee_ulbid = :ulbid
        `;
    } else {
        sql = `
            SELECT 
                num_employee_ulbid ulbid,
                num_employee_empid empid,
                var_employee_engname engname,
                var_employee_marname emp_marname,
                var_deptmst_deptnamee deptnamee,
                num_deptmst_deptid deptid,
                num_zone_id zone_id,
                var_zone_name zone_name,
                num_salarydtl_payheadid payheadid,
                SUM(NVL(num_salarydtl_amount, 0)) amount,
                num_salarydtl_payheadid num_empallowded_payheadid
            FROM 
                aopr_employee_def   
                INNER JOIN aopr_deptmst_def ON num_deptmst_deptid = num_employee_deptid   
                INNER JOIN aopr_zone_mas ON num_zone_id = num_employee_zone 
                INNER JOIN aopr_salarydtl_def ON num_salarydtl_empid = num_employee_empid 
                    AND num_salarydtl_ulbid = num_employee_ulbid  
            WHERE 
                1 = 1 
                AND num_employee_ulbid = :ulbid
        `;
    }
    
    const binds = { ulbid };
    
    if (categoryId && categoryId !== "-1") {
        sql += " AND num_employee_paysheettype = :categoryId";
        binds.categoryId = categoryId;
    }
    
    if (zoneId && zoneId !== "-1") {
        sql += " AND num_employee_zone = :zoneId";
        binds.zoneId = zoneId;
    }
    
    if (deptId && deptId !== "-1") {
        sql += " AND num_employee_deptid = :deptId";
        binds.deptId = deptId;
    }
    
    if (employeeId && employeeId !== "0") {
        sql += " AND num_employee_empid = :employeeId";
        binds.employeeId = employeeId;
    }
    
    if (payHeadId && payHeadId !== "0") {
        sql += " AND num_salarydtl_payheadid = :payHeadId";
        binds.payHeadId = payHeadId;
    }
    
    if (isSpecialUlb) {
        sql += `
            GROUP BY 
                num_employee_ulbid,
                var_deptslip_sequence,
                var_deptslip_code,
                var_employee_engname,
                var_employee_marname,
                var_deptmst_deptnamee,
                num_deptmst_deptid,
                num_zone_id,
                var_zone_name,
                num_salarydtl_payheadid
            ORDER BY var_employee_engname
        `;
    } else {
        sql += `
            GROUP BY 
                num_employee_ulbid,
                num_employee_empid,
                var_employee_engname,
                var_employee_marname,
                var_deptmst_deptnamee,
                num_deptmst_deptid,
                num_zone_id,
                var_zone_name,
                num_salarydtl_payheadid
            ORDER BY var_employee_engname
        `;
    }
    
    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

module.exports = {
    getEmployeeListRepo,
    getZoneListRepo,
    getEmployeePayHeadListRepo
};