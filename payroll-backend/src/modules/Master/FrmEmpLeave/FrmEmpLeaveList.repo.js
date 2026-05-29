const { executeQuery } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { withTx } = require("../../../db/tx");


async function getEmployeeLeaveBalanceRepo(payload) {

  try {

    let query = `
      SELECT
           num_employee_empid AS empid,
           var_employee_engname AS engname,
           num_employee_ulbid AS ulbid,

           NVL(num_empleave_PL, 0) AS PL,
           NVL(num_empleave_MEDLEAVE, 0) AS MEDLEAVE,
           NVL(num_empleave_HPMleave, 0) AS HPMleave,
           NVL(num_empleave_MetLeave1, 0) AS MetLeave1,
           NVL(num_empleave_MetLeave2, 0) AS MetLeave2,
           NVL(num_empleave_splleave, 0) AS splleave,
           NVL(num_empleave_OptionalLeave, 0) AS OptionalLeave,
           NVL(num_empleave_adhyayan, 0) AS adhyayan,
           NVL(num_empleave_ChildCare, 0) AS ChildCare,
           NVL(num_empleave_UnexpecLeave, 0) AS UnexpecLeave,
           NVL(num_empleave_SPLUnexpLeave, 0) AS SPLUnexpLeave,
           NVL(num_empleave_nosaldeduct, 0) AS nosaldeduct,
           NVL(num_empleave_casualleave, 0) AS casualleave,
           NVL(num_empleave_Total, 0) AS Total

      FROM aopr_employee_def

      LEFT JOIN aopr_empleave_det
        ON num_employee_empid = num_empleave_empid
       AND num_employee_ulbid = num_empleave_ulbid

      WHERE 1 = 1
    `;

    const bindParams = {};

    
    if (payload.ulbId) {

      query += `
        AND num_employee_ulbid = :UlbId
      `;

      bindParams.UlbId = payload.ulbId;
    }

   
    if (payload.empId) {

      query += `
        AND num_employee_empid = :EmpId
      `;

      bindParams.EmpId = payload.empId;
    }

    if (payload.empName) {

      query += `
        AND (
              UPPER(var_employee_engname)
              LIKE '%' || UPPER(:EmpName) || '%'

              OR

              UPPER(var_employee_marname)
              LIKE '%' || UPPER(:EmpName) || '%'
            )
      `;

      bindParams.EmpName = payload.empName;
    }

    if (payload.deptId) {

      query += `
        AND num_employee_deptid = :DeptId
      `;

      bindParams.DeptId = payload.deptId;
    }

    if (payload.categoryId) {

      query += `
        AND num_employee_paysheettype = :CategoryId
      `;

      bindParams.CategoryId = payload.categoryId;
    }

    query += `
      ORDER BY num_employee_empid ASC
    `;

    console.log(
      "Final Query:",
      query
    );

    console.log(
      "Bind Params:",
      bindParams
    );

    const result = await executeQuery(
      query,
      bindParams
    );

    return result.rows;

  } catch (err) {

    throw err;
  }
}
async function saveEmployeeLeaveBalanceRepo(
  data
) {

  try {

    const result = await withTx(

      async (conn) => {

        const res =
          await conn.execute(

            `BEGIN
                aopr_EmployeeLeave_Ins(
                  :in_userid,
                  :in_ulbid,
                  :in_str,
                  :out_errorcode,
                  :out_errormsg
                );
             END;`,

            {

              in_userid:
                data.userId,

              in_ulbid:
                Number(data.ulbId),

              in_str:
                data.str,

              out_errorcode: {

                dir:
                  oracledb.BIND_OUT,

                type:
                  oracledb.NUMBER

              },

              out_errormsg: {

                dir:
                  oracledb.BIND_OUT,

                type:
                  oracledb.STRING,

                maxSize:
                  4000

              }

            }

          );

        console.log(
          "saveEmployeeLeaveBalanceRepo",
          res
        );

        return res.outBinds;

      }

    );

    return {

      success: true,

      errorCode:
        result.out_errorcode,

      errorMsg:
        result.out_errormsg

    };

  } catch (err) {

    return {

      success: false,

      error: err.message

    };
  }
}
module.exports = {
  getEmployeeLeaveBalanceRepo,
  saveEmployeeLeaveBalanceRepo
};