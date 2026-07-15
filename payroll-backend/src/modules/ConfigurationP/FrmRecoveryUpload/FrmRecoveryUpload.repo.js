const { executeQuery } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { withTx } = require("../../../db/tx");

// Deduction Type List
async function getDeductionTypeListRepo() {
  try {
    const query = `
      SELECT
        num_deductiontype_id,
        var_deductiontype_name
      FROM aopr_deductiontype_mst
      ORDER BY var_deductiontype_name
    `;

    const result = await executeQuery(query, {});
    return result.rows;
  } catch (err) {
    throw err;
  }
}

{
  /*
// Recovery List
async function getRecoveryListRepo(payload) {
  try {
    const query = `
      SELECT
        e.NUM_RECOVER_ID,
        emp.VAR_EMPLOYEE_ENGNAME AS EMPLOYEE_NAME,
        e.NUM_RECOVER_AMOUNT,
        CASE
          WHEN TRIM(UPPER(e.VAR_RECOVER_ISWORKING)) = 'Y' THEN 'Yes'
          ELSE 'No'
        END AS ISWORKING,
        d.VAR_DEDUCTIONTYPE_NAME AS DEDUCTION_TYPE,
        a.VAR_MONTH_NAME AS FROMMONTH,
        a2.VAR_MONTH_NAME AS TOMONTH,
        c.VAR_YEAR AS FROMYEAR,
        c2.VAR_YEAR AS TOYEAR
      FROM AOPR_RECOVERY_MST e
      INNER JOIN AOPR_EMPLOYEE_DEF emp
        ON emp.NUM_EMPLOYEE_EMPID = e.NUM_RECOVER_EMPID
       AND e.NUM_RECOVER_ULBID = emp.NUM_EMPLOYEE_ULBID
      INNER JOIN AOPR_DEDUCTIONTYPE_MST d
        ON d.NUM_DEDUCTIONTYPE_ID = e.NUM_RECOVER_DEDUCTIONID
      LEFT JOIN ADMINS.AOUP_CALENDAR a
        ON a.NUM_MONTH_ID = e.VAR_RECOVER_FROMMONTH
      LEFT JOIN ADMINS.AOUP_CALENDAR a2
        ON a2.NUM_MONTH_ID = e.VAR_RECOVER_TOMONTH
      LEFT JOIN ADMINS.AOMA_YEAR c
        ON c.NUM_YEAR_ID = e.VAR_RECOVER_FROMYEAR
      LEFT JOIN ADMINS.AOMA_YEAR c2
        ON c2.NUM_YEAR_ID = e.VAR_RECOVER_TOYEAR
      WHERE e.NUM_RECOVER_EMPID = :empId
        AND e.NUM_RECOVER_ULBID = :ulbId
      ORDER BY e.NUM_RECOVER_ID DESC
    `;

    const result = await executeQuery(query, {
      empId: payload.empId,
      ulbId: payload.ulbId,
    });

    return result.rows;
  } catch (err) {
    console.error("Error in getRecoveryListRepo:", err);
    throw err;
  }
}

*/
}

// Save Recovery (Accumulation)
async function saveRecoveryRepo(data) {
  try {
    const result = await withTx(async (conn) => {
      // Handle null values for optional fields
      let subDeptIdValue = data.subDeptId;
      if (!subDeptIdValue || subDeptIdValue === "" || subDeptIdValue === "null" || subDeptIdValue === "undefined") {
        subDeptIdValue = null;
      }

      // Log the payload for debugging
      console.log("Saving Recovery Payload:", {
        userId: data.userId,
        empId: data.empId,
        deptId: data.deptId,
        subDeptId: subDeptIdValue,
        deductionId: data.deductionId,
        isWorking: data.isWorking,
        recovAmount: data.recovAmount,
        fromYear: data.fromYear,
        fromMonth: data.fromMonth,
        toYear: data.toYear,
        toMonth: data.toMonth,
        remark: data.remark,
        ulbId: data.ulbId,
      });

      // Call the stored procedure - similar to .NET BORecovery.InsertRecovery()
      const res = await conn.execute(
        `BEGIN
            AOPR_RECOVERY_INS(
              :in_UserId,
              :in_EmpId,
              :in_DeptId,
              :in_SubDeptId,
              :in_DeductionId,
              :in_IsWorking,
              :in_RecovAmount,
              :in_FromYear,
              :in_FromMonth,
              :in_ToYear,
              :in_ToMonth,
              :in_Remark,
              :in_UlbId,
              :out_ErrorCode,
              :out_ErrorMsg
            );
         END;`,
        {
          in_UserId: data.userId,
          in_EmpId: data.empId,
          in_DeptId: data.deptId,
          in_SubDeptId: subDeptIdValue,
          in_DeductionId: data.deductionId,
          in_IsWorking: data.isWorking,
          in_RecovAmount: data.recovAmount,
          in_FromYear: data.fromYear,
          in_FromMonth: data.fromMonth,
          in_ToYear: data.toYear,
          in_ToMonth: data.toMonth,
          in_Remark: data.remark || "",
          in_UlbId: data.ulbId,
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
    console.error("Error in saveRecoveryRepo:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

const insertRecoveryRepo = async (data) => {
  try {
    const result = await withTx(async (conn) => {
      const res = await conn.execute(
        `BEGIN
            aopr_recovery_ins(
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
                :in_deductionid,
                :in_remark,
                :in_UlbID,
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

          in_deductionid: data.deductionId,

          in_remark: data.remark,

          in_UlbID: data.ulbId,

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
      errorCode: -1,
      errorMsg: err.message,
    };
  }
};

module.exports = {
  getDeductionTypeListRepo,
  //getRecoveryListRepo,
  saveRecoveryRepo,
  insertRecoveryRepo
};
