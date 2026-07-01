const { executeQuery } = require("../../../db/queryExecutor");

async function getDepartmentsRepo(ulbId) {
  const sql = `
    SELECT deptname, deptid 
    FROM vw_deptconfig 
    WHERE ulbid = :ulbId
    ORDER BY deptname
  `;
  
  const result = await executeQuery(sql, { ulbId });
  if (!result.success) throw new Error(result.error);
  return result.rows;
}

async function getPayHeadsListRepo(ulbId) {
  const sql = `
    SELECT 
      var_payheads_ename,
      num_payheads_id
    FROM 
      aopr_payheads_def
    WHERE 
      num_payheads_ulbid = :ulbId 
      AND num_payheads_id IN (358, 359, 378, 269, 267, 364)
    ORDER BY 
      var_payheads_ename
  `;
  
  const result = await executeQuery(sql, { ulbId });
  if (!result.success) throw new Error(result.error);
  return result.rows;
}

async function searchDeductionsRepo({
  ulbId,
  deptId,
  payheadId,
  salDate
}) {
  const sql = `
    SELECT 
      EMPID,
      ENGNAME,
      DEDUCTIONNO,
      AMOUNT,
      SALDATE,
      PAYHEADID,
      ULBID,
      DEPTID,
      DEPTNAMEE,
      PAYHEAD_NAME
    FROM 
      vw_DeductionPayhead 
    WHERE 
      saldate = :salDate 
      AND payheadid = :payheadId 
      AND ulbid = :ulbId 
      AND deptid = :deptId
    ORDER BY 
      EMPID
  `;
  
  const binds = {
    salDate,
    payheadId,
    ulbId,
    deptId
  };
  
  const result = await executeQuery(sql, binds);
  if (!result.success) throw new Error(result.error);
  
  return result.rows;
}

module.exports = {
  getDepartmentsRepo,
  getPayHeadsListRepo,
  searchDeductionsRepo
};