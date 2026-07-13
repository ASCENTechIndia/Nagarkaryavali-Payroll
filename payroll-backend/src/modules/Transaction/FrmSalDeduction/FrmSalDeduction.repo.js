const { executeQuery } = require("../../../db/queryExecutor");
const { withTx } = require("../../../db/tx");
const oracledb = require("oracledb");

// ===============================
// Get Deduction Head List
// ===============================
const getDeductionHeadList = async (ulbId) => {
  let query = `
        select var_payheads_ename, num_payheads_id
        from aopr_payheads_def
        where num_payheads_ulbid = :ulbId
  `;

  query += `
        and num_payhead_subheadid in
        (
            select num_paysubheads_id
            from aopr_paysubheads_def
            where var_paysubheads_type = 'D'
        )
  `;

  const result = await executeQuery(query, { ulbId });

  return result;
};


const getEmployeeList = async ({ ulbId, deptId }) => {

  let query = `
        select num_employee_empid||'-'||var_employee_engname var_employee_engname,
               num_employee_empid
        from aopr_employee_def
        where num_employee_ulbid = :ulbId
          and num_employee_deptid = :deptId
    `;

  return await executeQuery(query, {
    ulbId,
    deptId,
  });

};

// ===============================
// Insert Salary Deduction
// ===============================
async function insertSalDeductionRepo(data) {

  try {

    const result = await withTx(async (conn) => {

      const res = await conn.execute(

        `BEGIN
            aopr_salpayheaddeduction_ins(
                :in_UserId,
                :in_CorpId,
                :in_DEPTID,
                :in_EmpId,
                :in_PAYHEADID,
                :in_DEDUCTIONTP,
                :in_DEDUCTTPAMT,
                :in_YEAR,
                :in_MONTH,
                :in_Reason,
                :out_ErrorCode,
                :out_ErrorMsg
            );
         END;`,

        {

          in_UserId: data.userId,

          in_CorpId: data.ulbId,

          in_DEPTID: data.deptId,

          in_EmpId: data.empId,

          in_PAYHEADID: data.payHeadId,

          in_DEDUCTIONTP: data.deductionType,

          in_DEDUCTTPAMT:
            Number(data.wholeAmt) !== 0
              ? data.wholeAmt
              : null,

          in_YEAR: data.year,

          in_MONTH: data.month,

          in_Reason: data.reason,

          out_ErrorCode: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER,
          },

          out_ErrorMsg: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 5000,
          },

        }

      );

      console.log(
        "insertSalDeductionRepo",
        res.outBinds
      );

      return res.outBinds;

    });

    return {

      success: true,

      errorCode: result.out_ErrorCode,

      errorMsg: result.out_ErrorMsg,

    };

  }
  catch (err) {

    console.log(err);

    return {

      success: false,

      error: err.message,

    };

  }

}



module.exports = {
  getDeductionHeadList,
  getEmployeeList,
  insertSalDeductionRepo
};
