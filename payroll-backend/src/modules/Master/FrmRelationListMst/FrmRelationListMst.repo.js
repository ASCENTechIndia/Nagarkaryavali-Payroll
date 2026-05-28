const { executeQuery } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { withTx } = require("../../../db/tx");

// ✅ Get Relation List
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

// ✅ Get Relation Details By Id
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

// ✅ Save / Update / Delete Relation
async function saveRelationRepo(data) {
  try {
    const result = await withTx(async (conn) => {
      const res = await conn.execute(
        `BEGIN
            aopr_relation_ins(
              :in_RelId,
              :in_CorpId,
              :in_RelName,
              :in_UserId,
              :in_Mode,
              :out_ErrorCode,
              :out_ErrorMsg
            );
         END;`,

        {
          in_RelId: data.relid,

          in_CorpId: data.corpId,

          in_RelName: data.relname,

          in_UserId: data.userId,

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

      console.log("saveRelationRepo", res);

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
  getRelationListRepo,
  getRelationByIdRepo,
  saveRelationRepo,
};
