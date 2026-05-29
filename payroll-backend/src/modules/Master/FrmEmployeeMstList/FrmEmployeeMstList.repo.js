const { executeQuery } = require("../../../db/queryExecutor");

async function getEmployeeCategoryRepo() {
  console.log("📤 Repo: Fetch Employee Categories");

  const sql = `
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

async function getSubDepartmentListRepo({ deptId, ulbid }) {
  console.log("📤 Repo: Fetch Sub Department List", {
    deptId,
    ulbid,
  });

  const sql = `
    SELECT 
      var_deptsub_sdeptnamee,
      num_deptsub_id
    FROM aopr_subdept_mas
    WHERE num_deptsub_deptid = :deptId
      AND num_deptsub_ulbid = :ulbid
    ORDER BY var_deptsub_sdeptnamee
  `;

  const binds = {
    deptId,
    ulbid,
  };

  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

async function searchEmployeeRepo(payload) {

  const {
    ulbid,
    paysheetType,//Category
    zoneId,
    deptId,
    subDeptId,
    employeeCode,
    employeeName,
  } = payload;

  const binds = { ulbid };

  const conditions = [
    `EM.num_employee_ulbid = :ulbid`
  ];

  // ✅ OPTIONAL FILTERS

  if (paysheetType) {
    conditions.push(`num_employee_paysheettype = :paysheetType`);
    binds.paysheetType = paysheetType;
  }

  if (zoneId) {
    conditions.push(`num_employee_zone = :zoneId`);
    binds.zoneId = zoneId;
  }

  if (deptId) {
    conditions.push(`num_employee_deptid = :deptId`);
    binds.deptId = deptId;
  }

  if (subDeptId) {
    conditions.push(`num_employee_subdeptid = :subDeptId`);
    binds.subDeptId = subDeptId;
  }

  // ✅ EMPLOYEE CODE FILTER
  if (employeeCode) {

    if (ulbid == 770 || ulbid == 1750) {
      conditions.push(`var_deptslip_sequence = :employeeCode`);
    } else if (ulbid == 1630) {
      conditions.push(`var_employee_oldempno = :employeeCode`);
    } else {
      conditions.push(`num_employee_empid = :employeeCode`);
    }
    binds.employeeCode = employeeCode;
  }

  // ✅ PARTIAL NAME SEARCH
  if (employeeName) {
    conditions.push(`
      UPPER(
        NVL(var_employee_engname, '') || ' ' ||
        NVL(var_employee_marname, '')
      ) LIKE '%' || UPPER(:employeeName) || '%'
    `);
    binds.employeeName = employeeName;
  }

  let sql = `
    SELECT 
      EM.num_employee_empid, num_employee_ulbid,
      CASE 
        WHEN ( EM.num_employee_ulbid = '751' OR EM.num_employee_ulbid = '870')
        THEN EM.var_employee_marname
        ELSE EM.var_employee_engname
      END employeename,
      EM.date_employee_dob,
      EM.var_employee_engname,
      EM.var_employee_psntaddress,
      EM.date_employee_joindate,
      EM.date_employee_confirmdate,
      EM.date_employee_retiremntdate,
      EM.num_employee_bankaccno,
      CM.var_category_name,
      CASE 
        WHEN ( ZM.ULBID = 2 AND ZM.ZONEID = 6 )
        THEN 'मुख्यालय'
        ELSE ZONENAME
      END var_zone_name,
      DD.var_deptmst_deptnamee,
      var_deptslip_sequence, DS.var_desigmst_designationname designation,var_employee_oldempno
    FROM aopr_employee_def EM
    LEFT JOIN aopr_category_mas CM
      ON CM.num_category_id = EM.num_employee_paysheettype
    LEFT JOIN vw_zoneconfig ZM
      ON ZM.ZONEID = EM.num_employee_zone
      AND ZM.ulbid = EM.num_employee_ulbid
    LEFT JOIN aopr_deptmst_def DD
      ON DD.num_deptmst_deptid = EM.num_employee_deptid
    LEFT JOIN aopr_designationmst_def DS
      ON DS.num_desigmst_designationid = EM.num_employee_desigid
    LEFT JOIN aopr_deptslip_mas
      ON EM.num_employee_empid = num_deptslip_empid
      AND EM.num_employee_ulbid = num_deptslip_ulbid
    WHERE ${conditions.join(" AND ")}
  `;

  if (ulbid == 1630) {
    sql += `
      ORDER BY
      REGEXP_SUBSTR( VAR_EMPLOYEE_OLDEMPNO, '^[A-Za-z]+'),
      TO_NUMBER( REGEXP_SUBSTR( VAR_EMPLOYEE_OLDEMPNO, '[0-9]+')),
      NVL( TO_NUMBER( REGEXP_SUBSTR( VAR_EMPLOYEE_OLDEMPNO, '-([0-9]+)$', 1, 1, NULL, 1)),0)
    `;
  } else {
    sql += ` ORDER BY EM.num_employee_empid`;
  }
  console.log("sql for searchEmployeeRepo:",sql)
  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

module.exports = {
  getEmployeeCategoryRepo,
  getZoneListRepo,
  getDepartmentListRepo,
  getSubDepartmentListRepo,
  searchEmployeeRepo
};