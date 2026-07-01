const { executeQuery } = require("../../../db/queryExecutor");

async function getPayHeadsListRepo(ulbId) {
  const sql = `
    SELECT 
      var_payheads_ename,
      num_payheads_id
    FROM 
      aopr_payheads_def
    WHERE 
      num_payheads_ulbid = :ulbId
    ORDER BY 
      var_payheads_ename
  `;
  
  const result = await executeQuery(sql, { ulbId });
  if (!result.success) throw new Error(result.error);
  return result.rows;
}

async function searchLoansAdvancesRepo({
  ulbId,
  payHeadId,
  empStatus,
  fromDate,
  isSpecialUlb
}) {
  let query = "";
  const binds = {};
  
  let effectiveFromDate = fromDate;
  if (!effectiveFromDate) {
    const today = new Date();
    effectiveFromDate = today.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }
  
  if (isSpecialUlb) {
    query = `
      SELECT 
        var_deptslip_sequence as empid,
        var_employee_engname as engname,
        var_bankmst_bankname as bankname,
        var_branchmst_branchname as branchname,
        var_branchmst_ifsccode as ifsccode,
        num_bankloan_bankaccno as bankaccno,
        num_salloanrec_install as deduction_amt,
        var_deptslip_code as billno,
        num_employee_ulbid as ulbid
    `;
  } else {
    query = `
      SELECT 
        num_employee_empid as empid,
        var_employee_engname as engname,
        var_bankmst_bankname as bankname,
        var_branchmst_branchname as branchname,
        var_branchmst_ifsccode as ifsccode,
        num_bankloan_bankaccno as bankaccno,
        num_salloanrec_install as deduction_amt,
        var_deptslip_code as billno,
        num_employee_ulbid as ulbid
    `;
  }
  
  query += `
    FROM aopr_salLoanRec_def
    INNER JOIN aopr_employee_def 
      ON num_salloanrec_empid = num_employee_empid 
      AND num_salloanrec_ulbid = num_employee_ulbid
    LEFT JOIN aopr_bankloan_def 
      ON num_bankloan_id = num_salloanrec_bankloanid 
      AND num_salloanrec_ulbid = num_bankloan_ulbid
    LEFT JOIN aopr_branchmst_def 
      ON num_branchmst_branchid = num_bankloan_branchid
    LEFT JOIN aopr_bankmst_def 
      ON num_branchmst_bankid = num_bankmst_bankid
    LEFT JOIN aopr_deptslip_mas 
      ON num_deptslip_ulbid = num_employee_ulbid 
      AND num_deptslip_empid = num_employee_empid
    WHERE TRUNC(dat_salloanrec_saldate) = TO_DATE(:fromDate, 'DD-MON-YYYY')
      AND num_salloanrec_ulbid = :ulbId
  `;
  
  binds.fromDate = effectiveFromDate;
  binds.ulbId = ulbId;
  
  if (payHeadId && payHeadId !== "0") {
    query += ` AND num_salloanrec_payheadid = :payHeadId`;
    binds.payHeadId = payHeadId;
  }
  
  if (isSpecialUlb && empStatus && empStatus !== "-1") {
    query += ` AND var_employee_empstatus = :empStatus`;
    binds.empStatus = empStatus;
  }
  
  query += ` ORDER BY empid`;
  
  const result = await executeQuery(query, binds);
  if (!result.success) throw new Error(result.error);
  
  return result.rows;
}

module.exports = {
  getPayHeadsListRepo,
  searchLoansAdvancesRepo
};