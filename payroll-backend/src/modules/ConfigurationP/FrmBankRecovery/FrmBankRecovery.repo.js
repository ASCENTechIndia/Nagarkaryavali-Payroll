const { executeQuery } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { withTx } = require("../../../db/tx");

// Month List
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

// Year List
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

// Bank Recovery List
async function getBankRecoveryListRepo(payload) {
  try {
    const query = `
      SELECT
        e.NUM_BANKRECOVER_ID,
        emp.VAR_EMPLOYEE_ENGNAME AS EMPLOYEE_NAME,
        b.VAR_BANKMST_BANKNAME AS BANK_NAME,
        br.VAR_BRANCHMST_BRANCHNAME AS BRANCH_NAME,
        e.NUM_BANKRECOVER_AMOUNT,
        CASE
          WHEN TRIM(UPPER(e.VAR_BANKRECOVER_ISWORKING)) = 'Y' THEN 'Yes'
          ELSE 'No'
        END AS ISWORKING,
        a.VAR_MONTH_NAME AS FROMMONTH,
        a2.VAR_MONTH_NAME AS TOMONTH,
        c.VAR_YEAR AS FROMYEAR,
        c2.VAR_YEAR AS TOYEAR
      FROM AOPR_BANKRECOVERY_MST e
      INNER JOIN AOPR_EMPLOYEE_DEF emp
        ON emp.NUM_EMPLOYEE_EMPID = e.NUM_BANKRECOVER_EMPID
       AND e.NUM_BANKRECOVER_ULBID = emp.NUM_EMPLOYEE_ULBID
      INNER JOIN AOPR_BANKMST_DEF b
        ON b.NUM_BANKMST_BANKID = e.NUM_BANKRECOVER_BANKID
      LEFT JOIN AOPR_BRANCHMST_DEF br
        ON br.NUM_BRANCHMST_BRANCHID = e.NUM_BANKRECOVER_BRANCHID
      LEFT JOIN ADMINS.AOUP_CALENDAR a
        ON a.NUM_MONTH_ID = e.VAR_BANKRECOVER_FROMMONTH
      LEFT JOIN ADMINS.AOUP_CALENDAR a2
        ON a2.NUM_MONTH_ID = e.VAR_BANKRECOVER_TOMONTH
      LEFT JOIN ADMINS.AOMA_YEAR c
        ON c.NUM_YEAR_ID = e.VAR_BANKRECOVER_FROMYEAR
      LEFT JOIN ADMINS.AOMA_YEAR c2
        ON c2.NUM_YEAR_ID = e.VAR_BANKRECOVER_TOYEAR
      WHERE e.NUM_BANKRECOVER_EMPID = :empId
        AND e.NUM_BANKRECOVER_ULBID = :ulbId
      ORDER BY e.NUM_BANKRECOVER_ID DESC
    `;

    const result = await executeQuery(query, {
      empId: payload.empId,
      ulbId: payload.ulbId,
    });

    return result.rows;
  } catch (err) {
    console.error("Error in getBankRecoveryListRepo:", err);
    throw err;
  }
}

// Save Recovery List
async function saveBankRecoveryRepo(data) {
  try {
    const result = await withTx(async (conn) => {
      let subDeptIdValue = data.subDeptId;
      if (!subDeptIdValue || subDeptIdValue === "" || subDeptIdValue === "null" || subDeptIdValue === "undefined") {
        subDeptIdValue = null;
      }

      let branchIdValue = data.branchId;
      if (!branchIdValue || branchIdValue === "" || branchIdValue === "null" || branchIdValue === "undefined") {
        branchIdValue = null;
      }
      console.log(data.isWorking);

      let isWorkingValue = 'N';
      if (data.isWorking === 'Y' || data.isWorking === true || data.isWorking === 'true'|| data.isWorking ==="true") {
        isWorkingValue = 'Y';
      }

      console.log("Saving ISWORKING value:", isWorkingValue);
      console.log("Saving payload:", {
        userId: data.userId,
        empId: data.empId,
        deptId: data.deptId,
        subDeptId: subDeptIdValue,
        isWorking: data.isWorking,
        recovAmount: data.recovAmount,
        fromYear: data.fromYear,
        fromMonth: data.fromMonth,
        toYear: data.toYear,
        toMonth: data.toMonth,
        bankId: data.bankId,
        branchId: branchIdValue,
        ulbId: data.ulbId
      });

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
          in_Subdeptid: subDeptIdValue,
          in_IsWorking: isWorkingValue,
          in_recovamount: data.recovAmount,
          in_fromyear: data.fromYear,
          in_fromonth: data.fromMonth,
          in_toyear: data.toYear,
          in_tomonth: data.toMonth,
          in_bankid: data.bankId,
          in_branchid: branchIdValue,
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
    console.error("Error in saveBankRecoveryRepo:", err);
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