const { executeQuery } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { withTx } = require("../../../db/tx");

async function getRelationListRepo() {
  try {
    const query = `
      SELECT
        num_relation_relationid AS relid,
        var_relation_name AS relname
      FROM aopr_relation_def
      ORDER BY num_relation_relationid
    `;

    const result = await executeQuery(query, {});

    return result.rows;
  } catch (err) {
    throw err;
  }
}

async function getRelationByIdRepo(payload) {
  try {
    const query = `
      SELECT
        num_relation_relationid AS relid,
        var_relation_name AS relname
      FROM aopr_relation_def
      WHERE num_relation_relationid = :relid
      ORDER BY num_relation_relationid
    `;

    const result = await executeQuery(query, {
      relid: payload.relid,
    });

    return result.rows;
  } catch (err) {
    throw err;
  }
}

async function saveRelationRepo(data) {
  try {
    const result = await withTx(async (conn) => {
      const corpId = data.corpId ? Number(data.corpId) : null;
      
      if (corpId === null || isNaN(corpId)) {
        throw new Error("corpId must be a valid number");
      }

      const res = await conn.execute(
        `BEGIN
            aopr_relation_ins(
              :in_UserId,
              :in_CorpId,
              :in_RelId,
              :in_RelName,
              :in_Mode,
              :out_ErrorCode,
              :out_ErrorMsg
            );
         END;`,
        {
          in_UserId: {
            dir: oracledb.BIND_IN,
            type: oracledb.STRING,
            val: data.userId
          },
          in_CorpId: {
            dir: oracledb.BIND_IN,
            type: oracledb.NUMBER,
            val: corpId 
          },
          in_RelId: {
            dir: oracledb.BIND_IN,
            type: oracledb.NUMBER,
            val: data.relid ? Number(data.relid) : null
          },
          in_RelName: {
            dir: oracledb.BIND_IN,
            type: oracledb.STRING,
            val: data.relname
          },
          in_Mode: {
            dir: oracledb.BIND_IN,
            type: oracledb.NUMBER,
            val: data.mode ? Number(data.mode) : null
          },
          out_ErrorCode: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER,
          },
          out_ErrorMsg: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 1000,
          },
        }
      );

      console.log("saveRelationRepo result:", res);

      return res.outBinds;
    });

    return {
      success: true,
      errorCode: result.out_ErrorCode,
      errorMsg: result.out_ErrorMsg,
    };
  } catch (err) {
    console.error("saveRelationRepo error:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

module.exports = {
  getRelationListRepo,
  getRelationByIdRepo,
  saveRelationRepo,
};
