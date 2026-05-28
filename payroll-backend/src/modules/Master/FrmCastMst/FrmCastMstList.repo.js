const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { withTx } = require("../../../db/tx");


async function getCastListRepo() {
  try {
    const query = `
      SELECT
        num_Cast_CastId castid,
        var_Cast_CastName castname
      FROM aopr_Cast_Def
      ORDER BY num_Cast_CastId
    `;

    const result = await executeQuery(
      query,
      {},
     
    );

    return result.rows;

  } catch (err) {
    throw err;
  }
}


async function getCastByIdRepo(payload) {
  try {

    const query = `
      SELECT
        num_Cast_CastId castid,
        var_Cast_CastName castname
      FROM aopr_Cast_Def
      WHERE num_Cast_CastId = :castid
      ORDER BY num_Cast_CastId
    `;

    const result = await executeQuery(
      query,
      {
        castid: payload.castid,
      },
   
    );

    return result.rows;

  } catch (err) {
    throw err;
  }
}


async function insertCastRepo(data) {

  try {

    const result = await withTx(async (conn) => {

      const res = await conn.execute(

        `BEGIN
            aopr_cast_ins(
              :in_corpId,
              :in_CastId,
              :in_CastName,
              :in_UserId,
              :in_Mode,
              :out_ErrorCode,
              :out_ErrorMsg
            );
         END;`,

        {

          in_corpId: data.corpId,

          in_CastId: data.castId ,

          in_CastName: data.castName,

          in_UserId: data.userId,

          in_Mode: data.mode,

          out_ErrorCode: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
          },

          out_ErrorMsg: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 1000
          }

        }

      );

      console.log(
        "insertCastRepo",
        res
      );

      return res.outBinds;

    });

    return {

      success: true,

      errorCode: result.out_ErrorCode,

      errorMsg: result.out_ErrorMsg

    };

  } catch (err) {

    return {

      success: false,

      error: err.message

    };
  }
}

module.exports = {
  getCastListRepo,
  getCastByIdRepo,
  insertCastRepo,
};