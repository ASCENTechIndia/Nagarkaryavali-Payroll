const oracledb = require("oracledb");
const { executeProcedure } = require("../../../db/procedureExecutor");

async function monthCloseRepo(payload) {
  console.log("📤 Repo: Month Close", payload);
    const lastDate = new Date(
  Number(payload.year),
  Number(payload.month),
  0
);
  const result = await executeProcedure({
    sql: `
      BEGIN
        aopr_monthclose_ins(
          :in_UserId,
          :in_Date,
          :in_ulbid,
          :out_ErrorCode,
          :out_ErrorMsg
        );
      END;
    `,
    binds: {
      in_UserId: payload.userId,
      in_Date: lastDate,
      in_ulbid: payload.ulbid,
      out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
    },
  });

  console.log("Procedure Result =>", result);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.outBinds;
}

module.exports = {
  monthCloseRepo,
};