const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { withTx } = require("../../../db/tx");

async function getRelationListRepo(payload) {

  try {

    const query = `
      SELECT
           num_relation_relationid,
           var_relation_name
      FROM aopr_relation_def
      LEFT JOIN aopr_relationconfig_def c
        ON c.num_relationconfig_relationid = num_relation_relationid
       AND c.num_relationconfig_ulbid = :UlbId
      ORDER BY var_relationconfig_activeflag
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

async function getConfiguredRelationRepo(payload) {

  try {

    const query = `
      SELECT
           num_relationconfig_relationid AS Configrelationid,
           var_relation_name
      FROM aopr_relation_def
      INNER JOIN aopr_relationconfig_def c
        ON c.num_relationconfig_relationid = num_relation_relationid
      WHERE c.var_relationconfig_activeflag = 'Y'
        AND c.num_relationconfig_ulbid = :UlbId
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

async function saveRelationConfigurationRepo(data) {

  try {

    const result = await withTx(async (conn) => {

      const res = await conn.execute(

        `BEGIN
            aopr_relationConfig_ins(
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
            data.relationStr,

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
  getRelationListRepo,
  getConfiguredRelationRepo,
  saveRelationConfigurationRepo
};