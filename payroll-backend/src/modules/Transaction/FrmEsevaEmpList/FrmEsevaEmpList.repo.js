const { executeQuery } = require("../../../db/queryExecutor");

async function getEmployeeStageRepo({ empid, ulbid }) {
    const sql = `
    SELECT var_stage_name,var_employee_engname,num_empstage_stageid
    FROM AOPR_EmpStage_det
    INNER JOIN aopr_stage_mas ON num_stage_id=num_empstage_stageid
    INNER JOIN aopr_employee_def ON num_empstage_empid=num_employee_empid AND num_empstage_ulbid=num_employee_ulbid
    WHERE num_empstage_empid=:empid
    AND num_empstage_stageid IN (
      SELECT MAX(num_empstage_stageid)
      FROM AOPR_EmpStage_det
      WHERE num_empstage_empid=:empid AND num_empstage_ulbid=:ulbid
    )
    AND num_empstage_ulbid=:ulbid
  `;

    const result = await executeQuery(sql, { empid, ulbid });
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getEmployeeListRepo({ ulbid, deptid, empid, empname, deptslipSequence }) {
    const conditions = ["EM.num_employee_ulbid=:ulbid"];
    const binds = { ulbid };

    if (deptid) {
        conditions.push("EM.num_employee_deptid=:deptid");
        binds.deptid = deptid;
    }

    if (Number(ulbid) === 930 && deptslipSequence) {
        conditions.push("DSM.var_deptslip_sequence=:deptslipSequence");
        binds.deptslipSequence = deptslipSequence;
    } else if (Number(ulbid) !== 930 && empid) {
        conditions.push("EM.num_employee_empid=:empid");
        binds.empid = empid;
    }

    if (empname) {
        conditions.push("UPPER(EM.var_employee_engname) LIKE UPPER(:empname)");
        binds.empname = `%${empname}%`;
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
      DSM.var_deptslip_sequence
    FROM aopr_employee_def EM
    LEFT JOIN aopr_category_mas CM ON CM.num_category_id=EM.num_employee_paysheettype
    LEFT JOIN aopr_zone_mas ZM ON ZM.num_zone_id=EM.num_employee_zone
    LEFT JOIN aopr_deptmst_def DD ON DD.num_deptmst_deptid=EM.num_employee_deptid
    LEFT JOIN aopr_deptslip_mas DSM ON EM.num_employee_empid=DSM.num_deptslip_empid AND EM.num_employee_ulbid=DSM.num_deptslip_ulbid
    WHERE ${conditions.join(" AND ")}
    ORDER BY EM.num_employee_empid
  `;

    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

module.exports = { getEmployeeStageRepo, getEmployeeListRepo };