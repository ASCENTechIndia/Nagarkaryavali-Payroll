const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { executeProcedure } = require("../../../db/procedureExecutor");

async function getEmployeeListRepo() {
  console.log("📤 Repo: Fetch Employee List");
  const sql = `
    SELECT
      var_employee_engname,
      num_employee_empid
    FROM aopr_employee_def
    ORDER BY var_employee_engname
  `;

  const result = await executeQuery(sql);

  if (!result.success) {
    throw new Error(result.error);
  }
  return result.rows;
}

async function getBillListRepo({ ulbid, deptid }) {
  console.log("📤 Repo: Fetch Bill List", { ulbid, deptid });
  if (![770, 1750, 930].includes(Number(ulbid))) {
    return [];
  }

  let sql = `
    SELECT DISTINCT
      TO_CHAR(var_deptslip_code) AS BILLCODE,
      var_deptslip_code AS BILLNO
    FROM aopr_deptslip_mas
    INNER JOIN (
      SELECT DISTINCT
        num_employee_empid,
        num_employee_ulbid
      FROM aopr_employee_def
      WHERE num_employee_ulbid = :ulbid
  `;

  const binds = { ulbid };

  if (deptid) {
    sql += `
      AND num_employee_deptid = :deptid
    `;
    binds.deptid = deptid;
  }
  sql += `
    ) e
      ON e.num_employee_empid = num_deptslip_empid
      AND e.num_employee_ulbid = num_deptslip_ulbid
    WHERE num_deptslip_ulbid = :ulbid
    ORDER BY BILLCODE
  `;

  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }
  return result.rows;
}

async function calculateSalaryRepo(payload) {
    console.log("📤 Repo: Salary Calculation", payload);
    const result = await executeProcedure({
        sql: `
        BEGIN
            aopr_salcalculate_insnew_ins(
                :in_UserId,
                :in_Date,
                :in_CategoryId,
                :in_zone,
                :in_dept,
                :in_UlbID,
                :in_subdepartment,
                :in_billno,
                :out_ErrorCode,
                :out_ErrorMsg
            );
        END;
        `,
        binds: {
            in_UserId: payload.userId,
            in_Date: payload.date,
            in_CategoryId: payload.categoryId,
            in_zone: payload.zone,
            in_dept: payload.dept,
            in_UlbID: payload.ulbid,
            in_subdepartment: payload.subdepartment || null,
            in_billno: payload.billno || null,
            out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
        },
    });

    console.log("Procedure Result =>", result);
    if (!result.success) {
        throw new Error(result.error);
    }
    return result.outBinds;
}

async function deleteSalaryRepo(payload) {
    console.log("📤 Repo: Delete Salary", payload);
    const result = await executeProcedure({
        sql: `
        BEGIN
            aopr_salcalculate_del_ins(
                :in_UserId,
                :in_Date,
                :in_CategoryId,
                :in_zone,
                :in_dept,
                :in_UlbID,
                :in_subdepartment,
                :in_billno,
                :out_ErrorCode,
                :out_ErrorMsg
            );
        END;
        `,
        binds: {
            in_UserId: payload.userId,
            in_Date: new Date(payload.date),
            in_CategoryId: payload.categoryId,
            in_zone: payload.zone,
            in_dept: payload.dept,
            in_UlbID: payload.ulbid,
            in_subdepartment: payload.subdepartment || null,
            in_billno: payload.billno || null,
            out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
        },
    });

    console.log("Procedure Result =>", result);

    if (!result.success) {
        throw new Error(result.error);
    }

    return result.outBinds;
}

module.exports = {
  getEmployeeListRepo,
  getBillListRepo,
  calculateSalaryRepo,
  deleteSalaryRepo
};