const { executeQuery } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { withTx } = require("../../../db/tx");

// ✅ Month List
async function getMonthListRepo() {
  try {
    const query = `
      SELECT
        num_month_id,
        var_month_name
      FROM admins.aoup_calendar
      ORDER BY num_month_id
    `;

    const result = await executeQuery(query, {});
    return result.rows;
  } catch (err) {
    throw err;
  }
}

// ✅ Year List
async function getYearListRepo() {
  try {
    const query = `
      SELECT
        num_year_id,
        var_year
      FROM admins.aoma_year
      ORDER BY var_year
    `;

    const result = await executeQuery(query, {});
    return result.rows;
  } catch (err) {
    throw err;
  }
}

// ✅ Bank Recovery List
async function getBankRecoveryListRepo(payload) {
  try {
    const query = `
      SELECT
        num_bankrecover_id,
        var_employee_engname,
        var_bankmst_bankname,
        var_branchmst_branchname,
        num_bankrecover_amount,
        CASE
          WHEN var_bankrecover_isworking = 'Y'
          THEN 'Yes'
          ELSE 'No'
        END AS isworking,
        a.var_month_name AS frommonth,
        b.var_month_name AS tomonth,
        c.var_year AS fromyear,
        d.var_year AS toyear
      FROM aopr_bankrecovery_mst e
      INNER JOIN aopr_employee_def
        ON num_employee_empid = num_bankrecover_empid
       AND e.num_bankrecover_ulbid = num_employee_ulbid
      INNER JOIN aopr_bankmst_def
        ON num_bankmst_bankid = num_bankrecover_bankid
      INNER JOIN aopr_branchmst_def
        ON num_branchmst_branchid = num_bankrecover_branchid
      INNER JOIN admins.aoup_calendar a
        ON a.num_month_id = var_bankrecover_frommonth
      INNER JOIN admins.aoup_calendar b
        ON b.num_month_id = var_bankrecover_tomonth
      INNER JOIN admins.aoma_year c
        ON c.num_year_id = var_bankrecover_fromyear
      INNER JOIN admins.aoma_year d
        ON d.num_year_id = var_bankrecover_toyear
      WHERE num_bankrecover_empid = :empId
        AND e.num_bankrecover_ulbid = :ulbId
    `;

    const result = await executeQuery(query, {
      empId: payload.empId,
      ulbId: payload.ulbId,
    });

    return result.rows;
  } catch (err) {
    throw err;
  }
}

async function saveBankRecoveryRepo(data) {
  try {
    const result = await withTx(async (conn) => {
      const res = await conn.execute(
        `BEGIN
            aopr_bankrecov_ins(
              :in_UserId,
              :in_EmpId,
              :in_deptid,
              :in_Subdeptid,
              :in_IsWorking,
              :in_recovamount,
              :in_fromyear,
              :in_fromonth,
              :in_toyear,
              :in_tomonth,
              :in_bankid,
              :in_branchid,
              :in_ulbid,
              :out_ErrorCode,
              :out_ErrorMsg
            );
         END;`,
        {
          in_UserId: data.userId,
          in_EmpId: data.empId,
          in_deptid: data.deptId,
          in_Subdeptid: data.subDeptId,
          in_IsWorking: data.isWorking,
          in_recovamount: data.recovAmount,
          in_fromyear: data.fromYear,
          in_fromonth: data.fromMonth,
          in_toyear: data.toYear,
          in_tomonth: data.toMonth,
          in_bankid: data.bankId,
          in_branchid: data.branchId,
          in_ulbid: data.ulbId,

          out_ErrorCode: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER,
          },

          out_ErrorMsg: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 5000,
          },
        },
      );

      return res.outBinds;
    });

    return {
      success: true,
      errorCode: result.out_ErrorCode,
      errorMsg: result.out_ErrorMsg,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}

module.exports = {
  getMonthListRepo,
  getYearListRepo,
  getBankRecoveryListRepo,
  saveBankRecoveryRepo
};
