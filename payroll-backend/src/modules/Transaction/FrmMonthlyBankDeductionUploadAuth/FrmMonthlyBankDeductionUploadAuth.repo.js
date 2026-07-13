const { executeQuery } = require("../../../db/queryExecutor");
const { withTx } = require("../../../db/tx");
const oracledb = require("oracledb");

// ===============================
// Get Monthly Bank Deduction Authorization List
// ===============================
const getMonthlyBankDeductionAuthList = async () => {
  const query = `
        SELECT
            num_bankdeduct_mainid AS mainId,
            var_deptmst_deptnamee AS department,
            TO_CHAR(dat_bankdeduct_saldate, 'DD/MM/YYYY') AS salaryDate,
            COUNT(num_bankdeduct_empid) AS employeeCount,
            SUM(num_bankdeduct_amount) AS bankDeductionAmount
        FROM aoms_bankdeduct_mas
        LEFT JOIN aopr_deptmst_def
            ON num_bankdeduct_deptid = num_deptmst_deptid
        WHERE var_bankdeduct_status = 'N'
        GROUP BY
            num_bankdeduct_mainid,
            var_deptmst_deptnamee,
            dat_bankdeduct_saldate
        ORDER BY dat_bankdeduct_saldate DESC
    `;

  return await executeQuery(query);
};

const getMonthlyBankDeductionAuthDetails = async (mainId) => {
  const query = `
      SELECT
          num_bankdeduct_empid Employee_Code,
          var_bankdeduct_empname Employee_Name,
          var_bankdeduct_deptname Department,
          TO_CHAR(dat_bankdeduct_saldate, 'FMMonth') Salary_Month_Year,
          var_bankdeduct_payheadname Deduction_Payhead,
          num_bankdeduct_amount Deduction_Amount,
          var_bankdeduct_remark Remarks,
          TO_NUMBER(TO_CHAR(SYSDATE,'MM')) month_num,
          TO_NUMBER(TO_CHAR(SYSDATE,'YYYY')) year_num,
          num_bankdeduct_deptid departmentId
      FROM aoms_bankdeduct_mas
      WHERE num_bankdeduct_mainid = :mainId
      ORDER BY num_bankdeduct_empid
  `;

  return await executeQuery(query, {
    mainId,
  });
};

module.exports = {
  getMonthlyBankDeductionAuthList,
  getMonthlyBankDeductionAuthDetails,
};
