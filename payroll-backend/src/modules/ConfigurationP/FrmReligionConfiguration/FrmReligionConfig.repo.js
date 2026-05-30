const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { withTx } = require("../../../db/tx");


async function getReligionListRepo(payload) {

  try {

    const query = `
      SELECT
           num_relegion_relegionid,
           var_relegion_name
      FROM aopr_relegion_def
      LEFT JOIN aopr_relegionconf_def c
        ON c.num_relegionconf_relegionid = num_relegion_relegionid
       AND c.num_relegionconf_ulbid = :UlbId
      ORDER BY var_relegionconf_activeflag
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

async function getConfiguredReligionRepo(payload) {

  try {

    const query = `
      SELECT
           num_relegionconf_relegionid AS Configrelationid,
           var_relegion_name
      FROM aopr_relegion_def
      INNER JOIN aopr_relegionconf_def c
        ON c.num_relegionconf_relegionid = num_relegion_relegionid
      WHERE c.var_relegionconf_activeflag = 'Y'
        AND c.num_relegionconf_ulbid = :UlbId
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


async function saveReligionConfigurationRepo(data) {

  try {

    const result = await withTx(async (conn) => {

      const res = await conn.execute(

        `BEGIN
            aopr_relegionconf_ins(
              :in_UserId,
              :in_ulbid,
              :in_Str,
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

          in_Str:
            data.religionStr,

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
  getReligionListRepo,
  getConfiguredReligionRepo,
  saveReligionConfigurationRepo
};