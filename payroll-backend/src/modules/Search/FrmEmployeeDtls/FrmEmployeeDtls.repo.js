const { executeQuery } = require("../../../db/queryExecutor");

const getEmployeeDetailsRepo = async (ulbid, empid) => {
    console.log("Repo: Get Employee Details", ulbid, empid);
    
    const sql = `
        SELECT 
            V.num_employee_empid, 
            V.var_employee_engname, 
            V.var_employee_marname, 
            V.date_employee_dob, 
            V.var_employee_gender, 
            V.var_employee_handicap,
            V.var_employee_psntaddress, 
            V.var_employee_pmntaddress, 
            V.num_employee_mobileno, 
            V.var_employee_emailid, 
            V.date_employee_joindate, 
            V.date_employee_confirmdate, 
            V.date_employee_retiremntdate, 
            V.var_employee_emptype, 
            V.num_employee_bankid, 
            V.num_employee_bankbrid,
            V.num_employee_bankaccno, 
            V.var_employee_pfno, 
            V.var_employee_panno, 
            V.num_employee_desigid, 
            V.num_employee_deptid, 
            V.num_employee_gradeid, 
            V.num_employee_payscaleid, 
            V.num_employee_gradepay, 
            V.num_employee_basic, 
            V.var_employee_vehicle, 
            V.var_employee_accomod, 
            V.var_employee_insby,
            V.date_employee_insdate, 
            V.var_employee_updtby, 
            V.date_employee_updtdate, 
            V.var_employee_socmem, 
            V.num_employee_pfpercent, 
            V.num_employee_pffixamt, 
            V.num_employee_defpfpercent, 
            V.num_employee_defpffixamt, 
            V.var_employee_machiatten, 
            V.num_employee_corpid,
            V.num_employee_paysheettype, 
            V.num_employee_zone, 
            V.num_employee_societyamt, 
            V.num_employee_aadharno, 
            V.date_employee_sumpeddate, 
            V.var_employee_paymode,
            V.num_employee_currbasic, 
            V.num_employee_currgradepay, 
            V.var_employee_ic,
            V.num_employee_mop, 
            V.num_employee_micr, 
            V.var_employee_levelofmanagement,
            V.num_employee_dscppercent, 
            V.num_employee_ulbid, 
            V.var_bankmst_bankname,
            V.var_payscalemst_payscalename,
            V.empstatus,
            V.dateservice, 
            V.homeaquasition,
            DM.var_deptslip_sequence,
            -- Get display names from master tables
            DD.var_deptmst_deptnamee AS var_deptmst_deptnamee,
            DS.var_desigmst_designationname AS var_desigmst_designationname,
            CM.var_category_name AS var_category_name,
            ZM.zonename AS var_zone_name
        FROM 
            view_Employeedtls V
        LEFT JOIN 
            aopr_deptslip_mas DM 
            ON V.num_employee_empid = DM.num_deptslip_empid 
            AND V.num_employee_ulbid = DM.num_deptslip_ulbid
        LEFT JOIN
            aopr_deptmst_def DD
            ON DD.num_deptmst_deptid = V.num_employee_deptid
        LEFT JOIN
            aopr_designationmst_def DS
            ON DS.num_desigmst_designationid = V.num_employee_desigid
        LEFT JOIN
            aopr_category_mas CM
            ON CM.num_category_id = V.num_employee_paysheettype
        LEFT JOIN
            vw_zoneconfig ZM
            ON ZM.zoneid = V.num_employee_zone 
            AND ZM.ulbid = V.num_employee_ulbid
        WHERE 
            V.num_employee_empid = :empid 
            AND V.num_employee_ulbid = :ulbid
    `

    const binds = { ulbid, empid };
    const result = await executeQuery(sql, binds);
    
    if (!result.success) {
        throw new Error(result.error);
    }
    
    return result.rows;
}

module.exports = {
    getEmployeeDetailsRepo
};