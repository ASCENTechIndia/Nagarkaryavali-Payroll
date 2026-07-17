const { executeQuery } = require("../../../db/queryExecutor");

const oracledb = require("oracledb");
const { executeProcedure } = require("../../../db/procedureExecutor");

const monthMap = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

function oracleDate(dateString) {
  const [day, month, year] = dateString.split("-");

  return {
    val: new Date(Number(year), monthMap[month], Number(day)),
    type: oracledb.DATE,
  };
}

async function runQuery(sql, binds) {
  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

async function getEarningData({ salDate, ulbid, deptid }) {
  const sql = `
        SELECT
            var_billpayhead_billno BILLNO,
            var_payheads_shortname PAYHEADS_ENAME,
            SUM(num_billpayhead_amount) AMOUNT
        FROM aopr_billpayhead_det
        INNER JOIN aopr_payheads_def
            ON num_billpayhead_payheadid = num_payheads_id
           AND num_billpayhead_ulbid = num_payheads_ulbid
        WHERE var_billpayhead_type = 'E'
          AND num_billpayhead_amount > 0
          AND dat_billpayhead_saldate = :salDate
          AND num_billpayhead_ulbid = :ulbid
          AND num_billpayhead_deptid = :deptid
        GROUP BY
            var_billpayhead_billno,
            var_payheads_shortname

        UNION ALL

        SELECT
            var_billaddpayhead_billno BILLNO,
            var_addpayheads_mname PAYHEADS_ENAME,
            SUM(num_billaddpayhead_amount) AMOUNT
        FROM aopr_billaddpayhead_det
        INNER JOIN aopr_addpayheads_def
            ON num_addpayheads_ulbid = num_billaddpayhead_ulbid
           AND num_addpayheads_id = num_billaddpayhead_aphid
        WHERE num_billaddpayhead_amount > 0
          AND dat_billaddpayhead_saldate = :salDate
          AND num_billaddpayhead_ulbid = :ulbid
          AND num_billaddpayhead_deptid = :deptid
        GROUP BY
            var_billaddpayhead_billno,
            var_addpayheads_mname
        ORDER BY BILLNO
    `;

  return await runQuery(sql, {
    salDate: oracleDate(salDate),
    ulbid,
    deptid,
  });
}

async function getDeductionData({ salDate, ulbid, deptid }) {
  const sql = `
        SELECT
            var_billpayhead_billno BILLNO,
            var_payheads_shortname PAYHEADS_ENAME,
            SUM(num_billpayhead_amount) AMOUNT
        FROM aopr_billpayhead_det
        INNER JOIN aopr_payheads_def
            ON num_billpayhead_payheadid = num_payheads_id
           AND num_billpayhead_ulbid = num_payheads_ulbid
        WHERE var_billpayhead_type = 'D'
          AND num_billpayhead_amount > 0
          AND dat_billpayhead_saldate = :salDate
          AND num_billpayhead_ulbid = :ulbid
          AND num_billpayhead_deptid = :deptid
        GROUP BY
            var_billpayhead_billno,
            var_payheads_shortname

        UNION ALL

        SELECT
            var_billaddpayhead_billno BILLNO,
            var_addpayheads_mname PAYHEADS_ENAME,
            SUM(num_billaddpayhead_amount) AMOUNT
        FROM aopr_billaddpayhead_det
        INNER JOIN aopr_addpayheads_def
            ON num_addpayheads_ulbid = num_billaddpayhead_ulbid
           AND num_addpayheads_id = num_billaddpayhead_aphid
        WHERE num_billaddpayhead_amount > 0
          AND dat_billaddpayhead_saldate = :salDate
          AND num_billaddpayhead_ulbid = :ulbid
          AND num_billaddpayhead_deptid = :deptid
        GROUP BY
            var_billaddpayhead_billno,
            var_addpayheads_mname
        ORDER BY BILLNO
    `;

  return await runQuery(sql, {
    salDate: oracleDate(salDate),
    ulbid,
    deptid,
  });
}

async function getPensionTotals({ salDate, ulbid, deptid }) {
  const sql = `
        SELECT

        NVL(
            (
                SELECT SUM(num_billpayhead_amount)
                FROM aopr_billpayhead_det
                WHERE var_billpayhead_type='E'
                  AND num_billpayhead_amount>0
                  AND dat_billpayhead_saldate=:salDate
                  AND num_billpayhead_ulbid=:ulbid
                  AND num_billpayhead_deptid=:deptid
            ),0
        )

        +

        NVL(
            (
                SELECT SUM(num_billaddpayhead_amount)
                FROM aopr_billaddpayhead_det
                WHERE num_billaddpayhead_amount>0
                  AND dat_billaddpayhead_saldate=:salDate
                  AND num_billaddpayhead_ulbid=:ulbid
                  AND num_billaddpayhead_deptid=:deptid
            ),0
        )

        AS TOTEARANDPENSION,

        NVL(
            (
                SELECT SUM(num_billpayhead_amount)
                FROM aopr_billpayhead_det
                WHERE var_billpayhead_type='D'
                  AND num_billpayhead_amount>0
                  AND dat_billpayhead_saldate=:salDate
                  AND num_billpayhead_ulbid=:ulbid
                  AND num_billpayhead_deptid=:deptid
            ),0
        )

        +

        NVL(
            (
                SELECT SUM(num_billaddpayhead_amount)
                FROM aopr_billaddpayhead_det
                WHERE num_billaddpayhead_amount>0
                  AND dat_billaddpayhead_saldate=:salDate
                  AND num_billaddpayhead_ulbid=:ulbid
                  AND num_billaddpayhead_deptid=:deptid
            ),0
        )

        AS TOTDUDANDPENSION

        FROM dual
    `;

  const rows = await runQuery(sql, {
    salDate: oracleDate(salDate),
    ulbid,
    deptid,
  });

  const pension = rows[0] || {};

  return {
    netEarning: Number(pension.TOTEARANDPENSION || 0),
    netDeduction: Number(pension.TOTDUDANDPENSION || 0),
    netPayable:
      Number(pension.TOTEARANDPENSION || 0) -
      Number(pension.TOTDUDANDPENSION || 0),
  };
}

async function getSubDetailData({ salDate, ulbid, deptid }) {
  const sql = `
        SELECT
            '' BILLNO,
            'पगार' PAYHEADS_ENAME,

            (
                NVL(
                    (
                        SELECT SUM(num_billpayhead_amount)
                        FROM aopr_billpayhead_det
                        WHERE var_billpayhead_type='E'
                        AND num_billpayhead_amount>0
                        AND dat_billpayhead_saldate=:salDate
                        AND num_billpayhead_ulbid=:ulbid
                        AND num_billpayhead_deptid=:deptid
                    ),0
                )

                +

                NVL(
                    (
                        SELECT SUM(num_billaddpayhead_amount)
                        FROM aopr_billaddpayhead_det
                        WHERE num_billaddpayhead_amount>0
                        AND dat_billaddpayhead_saldate=:salDate
                        AND num_billaddpayhead_ulbid=:ulbid
                        AND num_billaddpayhead_deptid=:deptid
                    ),0
                )

            )

            -

            (

                NVL(
                    (
                        SELECT SUM(num_billpayhead_amount)
                        FROM aopr_billpayhead_det
                        WHERE var_billpayhead_type='D'
                        AND num_billpayhead_amount>0
                        AND dat_billpayhead_saldate=:salDate
                        AND num_billpayhead_ulbid=:ulbid
                        AND num_billpayhead_deptid=:deptid
                    ),0
                )

                +

                NVL(
                    (
                        SELECT SUM(num_billaddpayhead_amount)
                        FROM aopr_billaddpayhead_det
                        WHERE num_billaddpayhead_amount>0
                        AND dat_billaddpayhead_saldate=:salDate
                        AND num_billaddpayhead_ulbid=:ulbid
                        AND num_billaddpayhead_deptid=:deptid
                    ),0
                )

            ) AMOUNT

        FROM dual

        UNION ALL

        SELECT
            var_billaddpayhead_billno BILLNO,
            var_addpayheads_mname PAYHEADS_ENAME,
            SUM(num_billaddpayhead_amount) AMOUNT
        FROM aopr_billaddpayhead_det
        INNER JOIN aopr_addpayheads_def
            ON num_addpayheads_ulbid=num_billaddpayhead_ulbid
            AND num_addpayheads_id=num_billaddpayhead_aphid
        WHERE num_billaddpayhead_amount>0
          AND dat_billaddpayhead_saldate=:salDate
          AND num_billaddpayhead_ulbid=:ulbid
          AND num_billaddpayhead_deptid=:deptid
        GROUP BY
            var_billaddpayhead_billno,
            var_addpayheads_mname

        UNION ALL

        SELECT
            var_billpayhead_billno BILLNO,
            var_payheads_shortname PAYHEADS_ENAME,
            SUM(num_billpayhead_amount) AMOUNT
        FROM aopr_billpayhead_det
        INNER JOIN aopr_payheads_def
            ON num_billpayhead_payheadid=num_payheads_id
            AND num_billpayhead_ulbid=num_payheads_ulbid
        WHERE var_billpayhead_type='D'
          AND num_billpayhead_amount>0
          AND dat_billpayhead_saldate=:salDate
          AND num_billpayhead_ulbid=:ulbid
          AND num_billpayhead_deptid=:deptid
        GROUP BY
            var_billpayhead_billno,
            var_payheads_shortname
    `;

  return await runQuery(sql, {
    salDate: oracleDate(salDate),
    ulbid,
    deptid,
  });
}

async function getDetailReportRepo(payload) {
  const earning = await getEarningData(payload);

  const deduction = await getDeductionData(payload);

  const pension = await getPensionTotals(payload);

  const detail = [];

  const maxRows = Math.max(earning.length, deduction.length);

  for (let i = 0; i < maxRows; i++) {
    detail.push({
      Earning_Head: earning[i]?.PAYHEADS_ENAME || "",

      Earning_Amount: Number(earning[i]?.AMOUNT || 0),

      Deduction_Head: deduction[i]?.PAYHEADS_ENAME || "",

      Deduction_Amount: Number(deduction[i]?.AMOUNT || 0),
    });
  }

  /**
   * Same rows added in .NET
   */

  detail.push({
    Earning_Head: "पेंशन फंडासह एकूण वेतन",

    Earning_Amount: pension.netEarning,

    Deduction_Head: "",

    Deduction_Amount: "",
  });

  detail.push({
    Earning_Head: "पेंशन फंडासह एकूण वजा",

    Earning_Amount: pension.netDeduction,

    Deduction_Head: "",

    Deduction_Amount: "",
  });

  const subDetail = await getSubDetailData(payload);

  return {
    detail,

    subDetail,

    netEarning: pension.netEarning,

    netDeduction: pension.netDeduction,

    netPayable: pension.netPayable,
  };
}
async function getSummaryReportRepo(payload) {
  const earning = await getEarningData(payload);

  const deduction = await getDeductionData(payload);

  const pension = await getPensionTotals(payload);

  const summary = [];

  const maxRows = Math.max(earning.length, deduction.length);

  for (let i = 0; i < maxRows; i++) {
    summary.push({
      Earning_Head: earning[i]?.PAYHEADS_ENAME || "",

      Earning_Amount: Number(earning[i]?.AMOUNT || 0),

      Deduction_Head: deduction[i]?.PAYHEADS_ENAME || "",

      Deduction_Amount: Number(deduction[i]?.AMOUNT || 0),
    });
  }

  summary.push({
    Earning_Head: "पेंशन फंडासह एकूण वेतन",

    Earning_Amount: pension.netEarning,

    Deduction_Head: "",

    Deduction_Amount: "",
  });

  summary.push({
    Earning_Head: "पेंशन फंडासह एकूण वजा",

    Earning_Amount: pension.netDeduction,

    Deduction_Head: "",

    Deduction_Amount: "",
  });

  return {
    summary,

    netEarning: pension.netEarning,

    netDeduction: pension.netDeduction,

    netPayable: pension.netPayable,
  };
}

async function generateBillRepo(payload) {
  return {
    success: true,
    message: "Bill generated successfully.",
  };
}

async function insertBillRepo(payload) {
  const [day, month, year] = payload.salDate.split("-");

  const monthMap = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  const salaryDate = new Date(Number(year), monthMap[month], Number(day));

  console.log("========== BILL INPUT ==========");
  console.log("User        :", payload.userId);
  console.log("Input Date  :", payload.salDate);
  console.log("Salary Date :", salaryDate.toDateString());
  console.log("Dept        :", payload.deptid);
  console.log("ULB         :", payload.ulbid);
  console.log("===============================");

  const result = await executeProcedure({
    sql: `
        BEGIN
            aopr_bill_ins(
                :in_UserId,
                :in_Date,
                :in_dept,
                :in_UlbID,
                :out_ErrorCode,
                :out_ErrorMsg
            );
        END;
        `,
    binds: {
      in_UserId: payload.userId,
      in_Date: {
        val: salaryDate,
        type: oracledb.DATE,
      },
      in_dept: Number(payload.deptid),
      in_UlbID: Number(payload.ulbid),
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
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return {
    success: result.outBinds.out_ErrorCode === 9999,
    errorCode: result.outBinds.out_ErrorCode,
    errorMsg: result.outBinds.out_ErrorMsg,
  };
}

module.exports = {
  generateBillRepo,

  getDetailReportRepo,

  getSummaryReportRepo,
  insertBillRepo,
};
