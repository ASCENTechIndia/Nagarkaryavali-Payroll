const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { executeProcedure } = require("../../../db/procedureExecutor");

async function getCategoryRepo({ ulbid }) {
    
    let sql = "";
    if (ulbid == 770 || ulbid == 1750) {
        sql = `
            SELECT 
                CASE 
                    WHEN UPPER(VAR_CATEGORY_NAME) = 'REGULAR' 
                    THEN 'Permanent' 
                    ELSE VAR_CATEGORY_NAME 
                END AS VAR_CATEGORY_NAME,
                NUM_CATEGORY_ID
            FROM aopr_category_mas
            ORDER BY VAR_CATEGORY_NAME
        `;
    } else {
        sql = `
            SELECT 
                VAR_CATEGORY_NAME,
                NUM_CATEGORY_ID
            FROM aopr_category_mas
            ORDER BY VAR_CATEGORY_NAME
        `;
    }
    
    const result = await executeQuery(sql);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getDepartmentRepo({ ulbid }) {
    const sql = `
        SELECT 
            deptname,
            deptid
        FROM vw_deptconfig
        WHERE ulbid = :ulbid
        ORDER BY deptname
    `;
    
    const binds = { ulbid };
    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getEmployeeSalaryListRepo({
    categoryId,
    deptId,
    subdeptId,
    billNo,
    searchEmpId,
    searchEmpName,
    salaryDate,
    ulbid,
    month,
    year
}) {
    let sql = `
        SELECT 
            num_salary_empid,
            var_employee_engname,
            var_grademst_gradename,
            num_salary_basic,
            num_salary_gradepay,
            num_salary_presentdays,
            zonename,
            var_deptmst_deptnamee,
            empsequence
        FROM view_paysheet
        WHERE num_salary_categoryid = :categoryId
        AND trunc(date_salary_saldate) = :salaryDate
        AND ulbid = :ulbid
    `;
    
    if (deptId && deptId !== "0") {
        sql += " AND num_salary_deptid = :deptId";
    }
    
    if (subdeptId && subdeptId !== "-1" && subdeptId !== "0") {
        if (ulbid == 770 || ulbid == 1750) {
            sql += " AND subdept = :subdeptId";
        } else {
            sql += ` AND num_salary_empid IN (
                SELECT num_employeedep_empid 
                FROM AOPR_EMPLOYEEDEP_CONF  
                WHERE num_employeedep_subdepid = :subdeptId 
                AND num_employeedep_depid = :deptId 
                AND num_employeedep_ulbid = :ulbid
            )`;
        }
    }
    
    if (billNo && billNo !== "0" && billNo !== "-1" && billNo !== "") {
        sql += " AND BILLCODE = :billNo";
    }
    
    if (searchEmpId && searchEmpId.trim() !== "") {
        if (ulbid == 770 || ulbid == 1750) {
            sql += " AND empsequence = :searchEmpId";
        } else {
            sql += " AND num_salary_empid = :searchEmpId";
        }
    }
    
    if (searchEmpName && searchEmpName.trim() !== "") {
        sql += " AND UPPER(var_employee_engname) LIKE UPPER(:searchEmpName)";
    }
    
    sql += `
        GROUP BY num_salary_empid, var_employee_engname, var_grademst_gradename,
                 num_salary_basic, num_salary_gradepay, num_salary_presentdays,
                 zonename, var_deptmst_deptnamee, empsequence
        ORDER BY var_employee_engname
    `;
    
    const binds = {
        categoryId,
        salaryDate,
        ulbid
    };
    
    if (deptId && deptId !== "0") binds.deptId = deptId;
    if (subdeptId && subdeptId !== "-1" && subdeptId !== "0") binds.subdeptId = subdeptId;
    if (billNo && billNo !== "0" && billNo !== "-1" && billNo !== "") binds.billNo = billNo;
    if (searchEmpId && searchEmpId.trim() !== "") binds.searchEmpId = searchEmpId;
    if (searchEmpName && searchEmpName.trim() !== "") binds.searchEmpName = `%${searchEmpName}%`;
    
    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getSubDepartmentRepo({ deptId, ulbid }) {
    
    let sql = `
        SELECT 
            var_deptsub_sdeptnamee,
            num_deptsub_id
        FROM aopr_subdept_mas
        WHERE num_deptsub_deptid = :deptId
        AND num_deptsub_ulbid = :ulbid
    `;

    if (ulbid == 770 || ulbid == 1750) {
        sql += `
            ORDER BY TO_NUMBER(NVL(
                REGEXP_SUBSTR(var_deptsub_sdeptnamee,'\\(([0-9]+(\\.[0-9]+)?)\\)',1,1,NULL,1),
                '0'
            ))
        `;
    } else {
        sql += " ORDER BY var_deptsub_sdeptnamee";
    }
    
    const binds = { deptId, ulbid };
    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getEmployeeSalaryDetailRepo({ empId, salaryDate, ulbid }) {
    const sql = `
        SELECT 
            num_salary_empid,
            var_employee_engname,
            var_desigmst_designationname,
            var_deptmst_deptnamee,
            var_grademst_gradename,
            total_days,
            num_salary_presentdays,
            withoutpay,
            medicalleave,
            earnedleave,
            halfday,
            trunc(date_salary_saldate) AS saldate,
            EMPsequence
        FROM view_paysheet
        WHERE num_salary_empid = :empId
        AND trunc(date_salary_saldate) = :salaryDate
        AND ulbid = :ulbid
        GROUP BY num_salary_empid, var_employee_engname, var_desigmst_designationname,
                 var_deptmst_deptnamee, var_grademst_gradename, total_days,
                 num_salary_presentdays, withoutpay, medicalleave, earnedleave,
                 halfday, trunc(date_salary_saldate), EMPsequence
    `;
    
    const binds = { empId, salaryDate, ulbid };
    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getSalaryEarningRepo({ empId, salaryDate, ulbid }) {
    const sql = `
        SELECT 
            var_payheads_ename,
            num_payheads_id,
            NVL(num_salarydtl_amount, 0) AS num_salarydtl_amount
        FROM vw_salarydtldef
        WHERE num_salarydtl_empid = :empId
        AND num_payhead_subheadid <> '55'
        AND num_salarydtl_amount > 0
        AND trunc(num_salarydtl_saldate) = :salaryDate
        AND num_salarydtl_ulbid = :ulbid
        ORDER BY var_payheads_ename
    `;
    
    const binds = { empId, salaryDate, ulbid };
    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getSalaryDeductionRepo({ empId, salaryDate, ulbid }) {
    let sql = `
        SELECT 
            var_payheads_ename,
            num_payheads_id,
            NVL(num_salarydtl_amount, 0) AS num_salarydtl_amount
        FROM vw_salarydtldef
        WHERE num_salarydtl_empid = :empId
        AND num_payhead_subheadid = '55'
        AND num_salarydtl_amount > 0
        AND trunc(num_salarydtl_saldate) = :salaryDate
        AND num_salarydtl_ulbid = :ulbid
    `;
    
    if (ulbid == 751) {
        sql += " AND NUM_PAYHEADS_ID NOT IN (367)";
    }
    
    sql += " ORDER BY var_payheads_ename";
    
    const binds = { empId, salaryDate, ulbid };
    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getBillNoRepo({ ulbid, deptId, subdeptId }) {
    let sql = `
        SELECT DISTINCT 
            TO_CHAR(var_deptslip_code) AS billcode,
            var_deptslip_code AS billno
        FROM aopr_deptslip_mas
        INNER JOIN (
            SELECT DISTINCT 
                num_employee_empid,
                num_employee_ulbid
            FROM aopr_employee_def
            WHERE num_employee_ulbid = :ulbid
    `;
    
    if (deptId && deptId !== "0" && deptId !== "") {
        sql += " AND num_employee_deptid = :deptId";
    }
    
    if (subdeptId && subdeptId !== "0" && subdeptId !== "-1" && subdeptId !== "") {
        sql += " AND num_employee_subdeptid = :subdeptId";
    }
    
    sql += `
        ) e ON e.num_employee_empid = num_deptslip_empid 
            AND e.num_employee_ulbid = num_deptslip_ulbid
        WHERE num_deptslip_ulbid = :ulbid
        ORDER BY billcode
    `;
    
    const binds = { ulbid };
    if (deptId && deptId !== "0" && deptId !== "") binds.deptId = deptId;
    if (subdeptId && subdeptId !== "0" && subdeptId !== "-1" && subdeptId !== "") binds.subdeptId = subdeptId;
    
    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function saveSalaryEditRepo(payload) {
    const result = await executeProcedure({
        sql: `
            BEGIN
                aopr_saledit_ins(
                    :In_UserId,
                    :In_Date,
                    :In_empid,
                    :In_ParamStr,
                    :In_Earnings,
                    :In_Deduction,
                    :In_PresentDays,
                    :In_WithoutPay,
                    :In_MedicalLeave,
                    :In_EarnedLeave,
                    :In_HalfDay,
                    :In_ULBID,
                    :out_ErrorCode,
                    :out_ErrorMsg
                );
            END;
        `,
        binds: {
            In_UserId: payload.userId,
            In_Date: payload.date,
            In_empid: payload.empid,
            In_ParamStr: payload.paramStr,
            In_Earnings: payload.earnings,
            In_Deduction: payload.deduction,
            In_PresentDays: payload.presentDays,
            In_WithoutPay: payload.withoutPay,
            In_MedicalLeave: payload.medicalLeave,
            In_EarnedLeave: payload.earnedLeave,
            In_HalfDay: payload.halfDay,
            In_ULBID: payload.ulbId,
            out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
        }
    });
    
    if (!result.success) throw new Error(result.error);
    
    return {
        errorCode: result.outBinds.out_ErrorCode,
        errorMsg: result.outBinds.out_ErrorMsg
    };
}

module.exports = {
    getCategoryRepo,
    getDepartmentRepo,
    getEmployeeSalaryListRepo,
    getSubDepartmentRepo,
    getEmployeeSalaryDetailRepo,
    getSalaryEarningRepo,
    getSalaryDeductionRepo,
    getBillNoRepo,
    saveSalaryEditRepo
};