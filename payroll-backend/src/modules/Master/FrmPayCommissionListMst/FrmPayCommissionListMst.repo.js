const { executeQuery } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { withTx } = require("../../../db/tx");

// ✅ Get Pay Commission List
async function getPayCommissionListRepo() {
  try {
    const query = `
      SELECT
        num_paycomm_id,
        var_paycomm_name,
        var_paycomm_code,
        CASE var_paycomm_flag
          WHEN 'Y' THEN 'Active'
          WHEN 'N' THEN 'InActive'
        END AS activeflag
      FROM aopr_paycomm_mst
      ORDER BY var_paycomm_name
    `;

    const result = await executeQuery(query, {});

    return result.rows;
  } catch (err) {
    throw err;
  }
}

// ✅ Get Pay Commission Details By Id
async function getPayCommissionByIdRepo(payload) {
  try {
    const query = `
      SELECT
        num_paycomm_id,
        var_paycomm_name,
        var_paycomm_code,
        var_paycomm_flag
      FROM aopr_paycomm_mst
      WHERE num_paycomm_id = :paycommid
    `;

    const result = await executeQuery(query, {
      paycommid: payload.paycommid,
    });

    return result.rows;
  } catch (err) {
    throw err;
  }
}

// ✅ Save / Update Pay Commission
async function savePayCommissionRepo(data) {
  try {
    const result = await withTx(async (conn) => {
      const res = await conn.execute(
        `BEGIN
            aopr_paycomm_ins(
              :in_UserId,
              :in_PaycId,
              :in_PaycName,
              :in_PaycCode,
              :in_Paycflag,
              :in_Mode,
              :out_ErrorCode,
              :out_ErrorMsg
            );
         END;`,

        {
          in_UserId: data.userId,

          in_PaycId: data.paycId,

          in_PaycName: data.paycName,

          in_PaycCode: data.paycCode,

          in_Paycflag: data.paycflag,

          in_Mode: data.mode,

          out_ErrorCode: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER,
          },

          out_ErrorMsg: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 1000,
          },
        },
      );

      console.log("savePayCommissionRepo", res);

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
  getPayCommissionListRepo,
  getPayCommissionByIdRepo,
  savePayCommissionRepo,
};
