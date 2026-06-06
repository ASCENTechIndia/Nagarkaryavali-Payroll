const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");

async function getDepartmentRepo({ ulbid }) {
    const sql = `
        SELECT 
            COUNT(empid) AS EmpCount, 
            deptnamee, 
            deptid 
        FROM VW_Dashbord 
        WHERE ulbid = :ulbid
        GROUP BY deptnamee, deptid 
        HAVING COUNT(empid) > 0
    `;
    
    const binds = { ulbid };
    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getDesignationRepo({ ulbid, deptid }) {
    const sql = `
        SELECT 
            COUNT(empid) AS EmpCount, 
            designationname, 
            designationid 
        FROM VW_Dashbord 
        WHERE ulbid = :ulbid 
            AND deptid = :deptid
        GROUP BY designationname, designationid 
        HAVING COUNT(empid) > 0
    `;
    
    const binds = { ulbid, deptid };
    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getEmployeeDetailsRepo({ ulbid, deptid, designationid, corpId }) {
    const empIdColumn = ulbid === '770' ? 'var_deptslip_sequence' : 'empid';
    
    const sql = `
        SELECT 
            ${empIdColumn} AS empid,
            var_deptslip_code AS billno,
            var_employee_engname,
            PSNTADDRESS,
            MOBILENO,
            DOB,
            JOINDATE 
        FROM VW_Dashbord 
        LEFT JOIN aopr_deptslip_mas 
            ON num_deptslip_ulbid = ulbid 
            AND num_deptslip_empid = empid 
        WHERE ulbid = :corpId 
            AND designationid = :designationid 
            AND deptid = :deptid
    `;
    
    const binds = { 
        corpId, 
        designationid, 
        deptid 
    };
    
    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

module.exports = {
    getDepartmentRepo,
    getDesignationRepo,
    getEmployeeDetailsRepo
};