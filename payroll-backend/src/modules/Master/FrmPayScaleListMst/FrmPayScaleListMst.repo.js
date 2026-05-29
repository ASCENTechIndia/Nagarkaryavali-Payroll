const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { withTx } = require("../../../db/tx");

// ✅ Get PayScale List
async function getPayScaleListRepo(payload) {
  try {
    let query = `
      SELECT
        payscaleid,
        payscalename
      FROM (
        SELECT
          num_payscalemst_payscaleid AS payscaleid,
          var_payscalemst_payscalename AS payscalename
        FROM aopr_payscalemst_def
    `;

    const binds = {};

    if (payload?.name) {
      query += `
        WHERE UPPER(var_payscalemst_payscalename)
        LIKE :name
      `;

      binds.name = `%${payload.name.toUpperCase()}%`;
    }

    query += `
        ORDER BY TRIM(UPPER(var_payscalemst_payscalename))
      )
    `;

    const result = await executeQuery(query, binds);

    return result.rows;
  } catch (err) {
    throw err;
  }
}

// ✅ Get PayScale Details By Id
async function getPayScaleByIdRepo(payload) {
  try {
    const query = `
      SELECT
        num_payscalemst_payscaleid,
        var_payscalemst_payscalename
      FROM aopr_payscalemst_def
      WHERE num_payscalemst_payscaleid = :payscaleid
    `;

    const result = await executeQuery(query, {
      payscaleid: payload.payscaleid,
    });

    return result.rows;
  } catch (err) {
    throw err;
  }
}

// ✅ Save / Update / Delete PayScale
async function savePayScaleRepo(data) {
  try {
    const result = await withTx(async (conn) => {
      const res = await conn.execute(
        `BEGIN
            aopr_payscale_ins(
              :in_userid,
              :in_payslid,
              :in_payScale,
              :in_mode,
              :out_errorcode,
              :out_errormsg
            );
         END;`,

        {
          in_userid: data.userId,

          in_payslid: data.payslid,

          in_payScale: data.payScale,

          in_mode: data.mode,

          out_errorcode: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER,
          },

          out_errormsg: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 5000,
          },
        },
      );

      console.log("savePayScaleRepo", res);

      return res.outBinds;
    });

    return {
      success: true,

      errorCode: result.out_errorcode,

      errorMsg: result.out_errormsg,
    };
  } catch (err) {
    return {
      success: false,

      error: err.message,
    };
  }
}

module.exports = {
  getPayScaleListRepo,
  getPayScaleByIdRepo,
  savePayScaleRepo,
};
