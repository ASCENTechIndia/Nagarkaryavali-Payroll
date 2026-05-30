const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { withTx } = require("../../../db/tx");


async function getPayCommissionListRepo(payload) {

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
      LEFT JOIN aopr_paycommconfig_def c
        ON c.num_paycommconfig_paycommid = num_paycomm_id
       AND c.num_paycommconfig_ulbid = :UlbId
      ORDER BY var_paycommconfig_activeflag
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


async function getConfiguredPayCommissionRepo(payload) {

  try {

    const query = `
      SELECT
           num_paycommconfig_paycommid AS confiPayComm_id,
           var_paycomm_name,
           var_paycomm_code,
           CASE var_paycomm_flag
                WHEN 'Y' THEN 'Active'
                WHEN 'N' THEN 'InActive'
           END AS activeflag
      FROM aopr_paycomm_mst
      INNER JOIN aopr_paycommconfig_def c
        ON c.num_paycommconfig_paycommid = num_paycomm_id
      WHERE var_paycommconfig_activeflag = 'Y'
        AND c.num_paycommconfig_ulbid = :UlbId
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


async function savePayCommissionConfigurationRepo(data) {

  try {

    const result = await withTx(async (conn) => {

      const res = await conn.execute(

        `BEGIN
            aopr_paycommconfig_ins(
              :in_UserId,
              :in_ulbid,
              :in_paycommStr,
              :in_Mode,
              :Out_ErrorCode,
              :Out_ErrorMsg
            );
         END;`,

        {

          in_UserId:
            data.userId,

          in_ulbid:
            Number(data.ulbId),

          in_paycommStr:
            data.payCommStr,

          in_Mode:
            Number(data.mode),

          Out_ErrorCode: {
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

      return res.outBinds;

    });

    return {

      success: true,

      errorCode:
        result.Out_ErrorCode,

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
  getPayCommissionListRepo,
  getConfiguredPayCommissionRepo,
  savePayCommissionConfigurationRepo
};