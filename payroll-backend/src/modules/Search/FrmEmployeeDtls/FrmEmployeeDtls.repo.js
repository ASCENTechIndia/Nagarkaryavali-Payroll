const { executeQuery } = require("../../../db/queryExecutor")

const getEmployeeDetailsRepo = async (ulbid, empid) => {
    console.log("Repo: Get Employee Details", ulbid, empid);
    
    const sql = `
        SELECT 
            num_employee_empid,
            var_employee_engname,
            var_employee_marname,
            date_employee_dob,
            var_employee_gender,
            var_employee_handicap,
            var_employee_psntaddress,
            var_employee_pmntaddress,
            num_employee_mobileno,
            var_employee_emailid,
            date_employee_joindate,
            date_employee_confirmdate,
            date_employee_retiremntdate,
            var_employee_emptype,
            num_employee_bankid,
            num_employee_bankbrid,
            num_employee_bankaccno,
            var_employee_pfno,
            var_employee_panno,
            num_employee_desigid,
            num_employee_deptid,
            num_employee_gradeid,
            num_employee_payscaleid,
            num_employee_gradepay,
            num_employee_basic,
            var_employee_vehicle,
            var_employee_accomod,
            var_employee_insby,
            date_employee_insdate,
            var_employee_updtby,
            date_employee_updtdate,
            var_employee_socmem,
            num_employee_pfpercent,
            num_employee_pffixamt,
            num_employee_defpfpercent,
            num_employee_defpffixamt,
            var_employee_machiatten,
            num_employee_corpid,
            num_employee_paysheettype,
            num_employee_zone,
            num_employee_societyamt,
            num_employee_aadharno,
            date_employee_sumpeddate,
            var_employee_paymode,
            num_employee_currbasic,
            num_employee_currgradepay,
            var_employee_ic,
            num_employee_mop,
            num_employee_micr,
            var_employee_levelofmanagement,
            num_employee_dscppercent,
            num_employee_ulbid,
            var_bankmst_bankname,
            var_payscalemst_payscalename,
            empstatus,
            dateservice,
            homeaquasition,
            var_deptslip_sequence
        FROM aopr_employee_def
        LEFT join aopr_deptslip_mas 
        ON num_employee_empid = num_deptslip_empid 
        AND num_employee_ulbid = num_deptslip_ulbid
        WHERE num_employee_empid = :empid 
        AND num_employee_ulbid = :ulbid
    `

    const binds = { ulbid, empid }
    const result = await executeQuery(sql, binds)
    
    if (!result.success) {
        throw new Error(result.error)
    }
    return result.rows
}

const getEmployeeImagesRepo = async (ulbid, empid) => {
    console.log("Repo: Get Employee Images", ulbid, empid);
    //need new query this is temporary
    const sql = `
        SELECT 
            PHOTO,
            SIGNATURE,
            THUMB
        FROM employee_images
        WHERE emp_id = :empid 
        AND ulb_id = :ulbid
    `

    const binds = { ulbid, empid }
    const result = await executeQuery(sql, binds)
    
    if (!result.success) {
        throw new Error(result.error)
    }
    
    if (!result.rows || result.rows.length === 0) {
        return [{ PHOTO: null, SIGNATURE: null, THUMB: null }]
    }
    
    return result.rows
}

const getOfficeGradeListRepo = async (ulbid) => {
    console.log("Repo: Get Office Grade List", ulbid);
    
    const sql = `
        SELECT 
            num_grademst_gradeid as GRADEID,
            var_grademst_gradename as GRADENAME
        FROM aopr_grademst_def
        --WHERE num_grademst_ulbid = :ulbid
        ORDER BY var_grademst_gradename
    `

    const binds = { ulbid }
    const result = await executeQuery(sql, [])
    console.log("repo log",result);
    console.log("repo binds",binds);
    if (!result.success) {
        throw new Error(result.error)
    }
    return result.rows
}

module.exports = {
    getEmployeeDetailsRepo,
    getEmployeeImagesRepo,
    getOfficeGradeListRepo
}