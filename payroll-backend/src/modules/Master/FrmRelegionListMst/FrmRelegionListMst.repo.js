const { executeQuery } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { withTx } = require("../../../db/tx");

// ✅ Get Religion List
const getReligionList = async () => {
  const query = `
    SELECT
      num_relegion_relegionid AS relid,
      var_relegion_name AS relname
    FROM aopr_relegion_def
    ORDER BY num_relegion_relegionid
  `;

  return await executeQuery(query);
};

// ✅ Get Religion Details By Id
const getReligionDetailsById = async (body) => {
  const { relId } = body;

  const query = `
    SELECT
      num_relegion_relegionid AS relid,
      var_relegion_name AS relname
    FROM aopr_relegion_def
    WHERE num_relegion_relegionid = :relId
    ORDER BY num_relegion_relegionid
  `;

  return await executeQuery(query, { relId });
};

// ✅ Save / Update / Delete Religion
async function saveReligionRepo(data) {
  try {
    const result = await withTx(async (conn) => {
      const res = await conn.execute(
        `BEGIN
            aopr_relegion_ins(
              :in_UserId,
              :in_RelId,
              :in_RelName,
              :in_Mode,
              :out_ErrorCode,
              :out_ErrorMsg
            );
         END;`,

        {
          in_UserId: data.userId,

          in_RelId: data.relId,

          in_RelName: data.relName,

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

      console.log("saveReligionRepo", res);

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
  getReligionList,
  getReligionDetailsById,
  saveReligionRepo,
};
