const { executeQuery } = require("../../../db/queryExecutor");

async function getCategoryListRepo({ ulbid }) {
  console.log("📤 Repo: Fetch Category List", { ulbid });

  let sql = `
    SELECT 
      CASE 
        WHEN UPPER(VAR_CATEGORY_NAME) = 'REGULAR' 
        THEN 'Permanent' 
        ELSE VAR_CATEGORY_NAME 
      END AS VAR_CATEGORY_NAME,
      NUM_CATEGORY_ID
    FROM aopr_category_mas
  `;

  // Special handling for specific ULBs
  if (ulbid === "770" || ulbid === "1750") {
    // Use the same query as above - no additional condition needed
    sql += ` ORDER BY VAR_CATEGORY_NAME`;
  } else {
    sql += ` ORDER BY VAR_CATEGORY_NAME`;
  }

  const result = await executeQuery(sql);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

async function getZoneListRepo({ ulbid }) {
  console.log("📤 Repo: Fetch Zone List", { ulbid });

  const sql = `
    SELECT 
      CASE 
        WHEN (ULBID = 2 AND ZONEID = 6) 
        THEN 'मुख्यालय' 
        ELSE ZONENAME 
      END AS ZONENAME,
      ZONEID
    FROM vw_zoneconfig
    WHERE ulbid = :ulbid
    ORDER BY ZONENAME
  `;

  const binds = { ulbid };
  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

async function getDepartmentListRepo({ ulbid }) {
  console.log("📤 Repo: Fetch Department List", { ulbid });

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

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

async function getEmployeeListRepo({ ulbid, deptId }) {
  console.log("📤 Repo: Fetch Employee List", { ulbid, deptId });

  let sql = `
    SELECT 
      num_employee_empid || '-' || var_employee_engname AS EmpName,
      num_employee_empid
    FROM aopr_employee_def
    WHERE num_employee_ulbid = :ulbid
  `;

  const binds = { ulbid };

  if (deptId && deptId !== "-1" && deptId !== "0") {
    sql += ` AND num_employee_deptid = :deptId`;
    binds.deptId = deptId;
  }

  sql += ` ORDER BY var_employee_engname`;

  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

async function searchLoansAdvancesRepo(payload) {
  const {
    ulbid,
    categoryId,
    zoneId,
    deptId,
    employeeId
  } = payload;

  const binds = { ulbid };
  const conditions = [`BL.num_bankloan_ulbid = :ulbid`];

  // Category filter
  if (categoryId && categoryId !== "-1") {
    conditions.push(`EM.num_employee_paysheettype = :categoryId`);
    binds.categoryId = categoryId;
  }

  // Zone filter
  if (zoneId && zoneId !== "-1") {
    conditions.push(`EM.num_employee_zone = :zoneId`);
    binds.zoneId = zoneId;
  }

  // Department filter
  if (deptId && deptId !== "-1") {
    conditions.push(`EM.num_employee_deptid = :deptId`);
    binds.deptId = deptId;
  }

  // Employee filter
  if (employeeId && employeeId !== "0") {
    conditions.push(`BL.num_bankloan_empid = :employeeId`);
    binds.employeeId = employeeId;
  }

  const sql = `
    SELECT 
      BL.num_bankloan_id AS BankLoanId,
      BL.num_bankloan_empid AS EmpId,
      BL.num_bankloan_empid || '-' || EM.var_employee_engname AS EmpName,
      BL.num_bankloan_payheads_id AS PayHeadId,
      PH.var_payheads_ename AS PayHeadsName,
      BL.num_bankloan_bankaccno AS BankAccNo,
      BL.num_bankloan_loanamt AS LoanAmt,
      BL.num_bankloan_installamt AS InstallAmt,
      BL.num_bankloan_intrate AS BankItrstRate,
      BL.var_bankloan_active AS Active,
      BL.var_bankloan_remark AS BRemark,
      BL.num_bankloan_interestamt AS BankInterestAmt,
      BL.date_bankloan_startdate AS LoanStartDate,
      BL.date_bankloan_enddate AS LoanEndDate,
      CM.var_category_name,
      ZM.var_zone_name,
      DD.var_deptmst_deptnamee,
      BL.num_bankloan_branchid AS BranchId,
      BB.branchname,
      BB.bankname,
      DS.var_deptslip_sequence AS slipno,
      DS.var_deptslip_code AS billno
    FROM aopr_bankloan_def BL
    INNER JOIN aopr_employee_def EM 
      ON BL.num_bankloan_empid = EM.num_employee_empid 
      AND BL.num_bankloan_ulbid = EM.num_employee_ulbid
    INNER JOIN view_payheads PH 
      ON BL.num_bankloan_payheads_id = PH.num_payheads_id 
      AND PH.num_payheads_ulbid = EM.num_employee_ulbid
    INNER JOIN aopr_category_mas CM 
      ON CM.num_category_id = EM.num_employee_paysheettype
    INNER JOIN aopr_zone_mas ZM 
      ON ZM.num_zone_id = EM.num_employee_zone
    INNER JOIN aopr_deptmst_def DD 
      ON DD.num_deptmst_deptid = EM.num_employee_deptid
    LEFT JOIN view_bankbranch BB 
      ON BL.num_bankloan_branchid = BB.branchid
    LEFT JOIN aopr_deptslip_mas DS 
      ON DS.num_deptslip_ulbid = EM.num_employee_ulbid 
      AND DS.num_deptslip_empid = EM.num_employee_empid
    WHERE ${conditions.join(" AND ")}
    ORDER BY BL.num_bankloan_empid
  `;

  console.log("SQL for searchLoansAdvancesRepo:", sql);

  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

module.exports = {
  getCategoryListRepo,
  getZoneListRepo,
  getDepartmentListRepo,
  getEmployeeListRepo,
  searchLoansAdvancesRepo
};