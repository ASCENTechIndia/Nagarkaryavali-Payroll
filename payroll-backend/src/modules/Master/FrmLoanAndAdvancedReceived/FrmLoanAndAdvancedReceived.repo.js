const { executeQuery } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { withTx } = require("../../../db/tx");

const getLoanAndAdvancedReceivedRepo = async (
  ulbId,
  payHeadId,
  salaryDate,
  employeeType
) => {

  try {
    let query = `
      SELECT
        num_employee_empid AS empid,
        var_employee_engname AS engname,
        var_bankmst_bankname AS bankname,
        var_branchmst_branchname AS branchname,
        var_branchmst_ifsccode AS ifsccode,
        num_bankloan_bankaccno AS bankaccno,
        num_salloanrec_install AS deduction_amt,
        var_deptslip_code AS billno,
        num_employee_ulbid AS ulbid

      FROM aopr_salLoanRec_def

      INNER JOIN aopr_employee_def
        ON num_salloanrec_empid = num_employee_empid
        AND num_salloanrec_ulbid = num_employee_ulbid

      LEFT JOIN aopr_bankloan_def
        ON num_bankloan_id = num_salloanrec_bankloanid
        AND num_salloanrec_ulbid = num_bankloan_ulbid

      LEFT JOIN aopr_branchmst_def
        ON num_branchmst_branchid = num_bankloan_branchid

      LEFT JOIN aopr_bankmst_def
        ON num_branchmst_bankid = num_bankmst_bankid

      LEFT JOIN aopr_deptslip_mas
        ON num_deptslip_ulbid = num_employee_ulbid
        AND num_deptslip_empid = num_employee_empid

      WHERE trunc(dat_salloanrec_saldate) =
            TO_DATE(:salaryDate,'DD-MM-YYYY')
      AND num_salloanrec_ulbid = :ulbId
    `;

    const binds = {
      salaryDate,
      ulbId,
      payHeadId,
    };

    if(
      payHeadId !=0
    ){
      query += `
        AND num_salloanrec_payheadid = :payHeaadId
      `;
    }

    if (
      ulbId === 770 ||
      ulbId === 1750
    ) {
      query += `
        AND VAR_EMPLOYEE_EMPSTATUS = :employeeType
      `;

      binds.employeeType = employeeType;
    }

    const result = await executeQuery(
      query,
      binds,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  } catch(err){
    throw err;
  }
  }

module.exports = {
  getLoanAndAdvancedReceivedRepo,
};