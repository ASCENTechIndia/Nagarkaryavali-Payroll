const { executeQuery } = require("../../../db/queryExecutor");

async function getRetiredEmployeeListRepo({
  ulbid,
  zoneId,
  deptId,
  subDeptId,
  billNo,
  month,
  year
}) {

  const monthNum = parseInt(month);
  const yearNum = parseInt(year);

  const firstDate = new Date(yearNum, monthNum - 1, 1);
  const lastDate = new Date(yearNum, monthNum, 0);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const firstDateStr = formatDate(firstDate);
  const lastDateStr = formatDate(lastDate);

  console.log("Date range:", { firstDateStr, lastDateStr });

  let sql = `
    SELECT 
      var_deptslip_code AS BILLNO,
      var_employee_engname AS NAME,
      TO_CHAR(DATE_EMPLOYEE_RETIREMNTDATE, 'DD/MM/YYYY') AS RETIREDATE,
      var_deptmst_deptnamee AS DEPARTMENT,
      var_retres_name AS TYPE,
      var_grademst_gradename AS GRADE,
      TO_CHAR(DATE_EMPLOYEE_DOB, 'DD/MM/YYYY') AS DOB,
      var_desigmst_designationname AS DESIGNATION,
      var_deptsub_sdeptnamee AS SUBDEPT,
      num_employee_empid AS OLDSLIPNO,
      '' AS NEWSLIPNO,
      var_employee_oldempno AS OLDEMPNO,
      num_employee_ulbid AS ULBID,
      num_employee_empid AS EMPID
    FROM aopr_employee_def
    INNER JOIN aopr_retirement_def 
      ON num_retirement_ulbid = num_employee_ulbid 
      AND num_retirement_empid = num_employee_empid
    LEFT JOIN aopr_deptslip_mas 
      ON num_employee_ulbid = num_deptslip_ulbid 
      AND num_employee_empid = num_deptslip_empid
    LEFT JOIN aopr_deptmst_def 
      ON num_deptmst_deptid = num_employee_deptid
    LEFT JOIN aopr_retirementreson_def 
      ON NUM_RETRES_ID = NUM_RETIREMENT_RETIRMENID
    LEFT JOIN aopr_designationmst_def 
      ON num_desigmst_designationid = num_employee_desigid
    LEFT JOIN aopr_subdept_mas 
      ON num_deptsub_deptid = num_deptmst_deptid 
      AND num_deptsub_id = num_employee_subdeptid 
      AND num_deptsub_ulbid = num_employee_ulbid
    LEFT JOIN aopr_grademst_def 
      ON num_grademst_gradeid = num_employee_gradeid
    WHERE num_employee_ulbid = '${ulbid}'
      AND DATE_EMPLOYEE_RETIREMNTDATE IS NOT NULL
      AND EXTRACT(MONTH FROM DATE_EMPLOYEE_RETIREMNTDATE) = ${month}
      AND EXTRACT(YEAR FROM DATE_EMPLOYEE_RETIREMNTDATE) = ${year}
      AND num_employee_zone = '${zoneId}'
  `;

  if (deptId && deptId !== "-1") {
    sql += ` AND num_employee_deptid = '${deptId}'`;
  }

  if (subDeptId && subDeptId !== "-1" && subDeptId !== "0") {
    sql += ` AND num_employee_subdeptid = '${subDeptId}'`;
  }

  if (billNo && billNo !== "0" && billNo !== "-1" && billNo !== "") {
    sql += ` AND var_deptslip_code = '${billNo.trim()}'`;
  }

  sql += ` ORDER BY var_employee_engname`;

  console.log("=== EXECUTING SQL ===");
  console.log(sql);
  console.log("=====================");

  const result = await executeQuery(sql);

  if (!result.success) {
    console.error("SQL Error:", result.error);
    throw new Error(result.error);
  }

  console.log("Query returned:", result.rows ? result.rows.length : 0, "rows");
  
  if (result.rows && result.rows.length > 0) {
    console.log("First row keys:", Object.keys(result.rows[0]));
    console.log("First row data:", JSON.stringify(result.rows[0], null, 2));
  }

  return result.rows;
}

module.exports = {
  getRetiredEmployeeListRepo
};