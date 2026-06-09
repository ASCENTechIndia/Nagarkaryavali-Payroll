const {executeQuery} = require("../../../db/queryExecutor")

const getCorporationRepo = async() => {
    console.log(" Repo: Corporation List Repo");
    const sql = `select CORPORATIONID, CORPORATIONNAME from prop.vw_corporation`

    const result = await executeQuery(sql)

    if (!result) {
        throw new Error(result.error)
    }
    return result?.rows
}

const getEmployeeSearchRepo = async(payload) => {
  const {ulbid, deptid, sequence, empid, desigid, empName, empNameM, paysheettype, mobileno, gender, zoneid, dob, joinDate} = payload;

  const conditions = ["EM.num_employee_ulbid = :ulbid"];

  const binds = {ulbid};

  if (deptid !== null) {
    conditions.push("EM.num_employee_deptid = :deptid");
    binds.deptid = deptid;
  }

  if ((ulbid === 770 || ulbid === 1750) && sequence !== null) {
    conditions.push("var_deptslip_sequence = :sequence");
    binds.sequence = sequence;
  }

  if ( ulbid !== 770 && ulbid !== 1750 && empid !== null) {
    conditions.push("EM.num_employee_empid = :empid");
    binds.empid = empid;
  }

  if (desigid !== null) {
    conditions.push("EM.num_employee_desigid = :desigid");
    binds.desigid = desigid;
  }

  if (empName !== null) {
    conditions.push("UPPER(EM.var_employee_engname) LIKE '%' || UPPER(:empName) || '%'");
    binds.empName = empName;
  }

  if (empNameM !== null) {
    conditions.push("EM.var_employee_marname LIKE '%' || :empNameM || '%'");
    binds.empNameM = empNameM;
  }

  if (paysheettype !== null) {
    conditions.push("EM.num_employee_paysheettype = :paysheettype");
    binds.paysheettype = paysheettype;
  }

  if (mobileno !== null) {
    conditions.push("EM.num_employee_mobileno LIKE '%' || :mobileno || '%'");
    binds.mobileno = mobileno;
  }

  if (gender !== null) {
    conditions.push("EM.var_employee_gender = :gender");
    binds.gender = gender;
  }

  if (zoneid !== null) {
    conditions.push("EM.num_employee_zone = :zoneid");
    binds.zoneid = zoneid;
  }

  if (dob !== null) {
    conditions.push("TRUNC(EM.date_employee_dob) = TRUNC(:dob)");
    binds.dob = new Date(dob);
  }

  if (joinDate !== null) {
    conditions.push("TRUNC(EM.date_employee_joindate) <= TRUNC(:joinDate)");
    binds.joinDate = new Date(joinDate);
  }

  const sql = `
    SELECT
      EM.num_employee_empid,
      EM.num_employee_ulbid,
      EM.var_employee_engname,
      EM.date_employee_dob,
      EM.var_employee_psntaddress,
      EM.date_employee_joindate,
      EM.date_employee_confirmdate,
      EM.date_employee_retiremntdate,
      EM.num_employee_bankaccno,
      CM.var_category_name,
      ZM.var_zone_name,
      DD.var_deptmst_deptnamee,
      var_deptslip_sequence
    FROM aopr_employee_def EM
    INNER JOIN aopr_category_mas CM
      ON CM.num_category_id = EM.num_employee_paysheettype
    INNER JOIN aopr_designationmst_def DS
      ON DS.num_desigmst_designationid =
         EM.num_employee_desigid
    INNER JOIN aopr_zone_mas ZM
      ON ZM.num_zone_id = EM.num_employee_zone
    INNER JOIN aopr_deptmst_def DD
      ON DD.num_deptmst_deptid =
         EM.num_employee_deptid
    LEFT JOIN aopr_deptslip_mas
      ON EM.num_employee_empid =
         num_deptslip_empid
      AND EM.num_employee_ulbid =
          num_deptslip_ulbid
    WHERE ${conditions.join(" AND ")}
    ORDER BY EM.num_employee_empid
  `;

  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }
  return result.rows;
}

module.exports = {
    getCorporationRepo,
    getEmployeeSearchRepo
}