const { executeQuery } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { withTx } = require("../../../db/tx");


async function getPayScaleListRepo(payload) {

  try {

    const query = `
      SELECT
           num_payscalemst_payscaleid,
           var_payscalemst_payscalename
      FROM aopr_payscalemst_def
      LEFT JOIN aopr_payscaleconfig_def c
        ON c.num_payslconfig_payscaleid = num_payscalemst_payscaleid
       AND c.num_payslconfig_ulbid = :UlbId
      ORDER BY var_payslconfig_activeflag
    `;

    const result = await executeQuery(
      query,
      {
        UlbId: payload.ulbId
      }
    );

    return result.rows;

  } catch (err) {
    throw err;
  }
}

async function getConfiguredPayScaleRepo(payload) {

  try {

    const query = `
      SELECT
           num_payslconfig_payscaleid AS confiPayScale_id,
           var_payscalemst_payscalename
      FROM aopr_payscalemst_def
      INNER JOIN aopr_payscaleconfig_def c
        ON c.num_payslconfig_payscaleid = num_payscalemst_payscaleid
      WHERE c.var_payslconfig_activeflag = 'Y'
        AND c.num_payslconfig_ulbid = :UlbId
    `;

    const result = await executeQuery(
      query,
      {
        UlbId: payload.ulbId
      }
    );

    return result.rows;

  } catch (err) {
    throw err;
  }
}

async function savePayScaleConfigurationRepo(data) {

  try {

    const result = await withTx(async (conn) => {

      const res = await conn.execute(

        `BEGIN
            aopr_payscaleconfig_ins(
              :in_UserId,
              :in_Orgid,
              :in_str,
              :in_Mode,
              :in_ipaddress,
              :in_source,
              :Out_errorCode,
              :Out_ErrorMsg
            );
         END;`,

        {

          in_UserId:
            data.userId,

          in_Orgid:
            Number(data.orgId),

          in_str:
            data.payScaleStr,

          in_Mode:
            Number(data.mode),

          in_ipaddress:
            data.ipAddress || "::1",

          in_source:
            data.source || "WEB",

          Out_errorCode: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
          },

          Out_ErrorMsg: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 4000
          }

        }

      );

      console.log(
        "savePayScaleConfigurationRepo",
        res
      );

      return res.outBinds;

    });

    return {

      success: true,

      errorCode:
        result.Out_errorCode,

      errorMsg:
        result.Out_ErrorMsg

    };

  } catch (err) {

    return {

      success: false,

      error: err.message

    };
  }
}

module.exports = {
  getPayScaleListRepo,
  getConfiguredPayScaleRepo,
  savePayScaleConfigurationRepo
};