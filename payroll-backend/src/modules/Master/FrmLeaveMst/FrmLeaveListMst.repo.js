const oracledb = require("oracledb");

const { executeQuery } = require("../../../db/queryExecutor");

const { withTx } = require("../../../db/tx");



async function getLeaveListRepo(payload) {

  try {

    const query = `
      SELECT
          num_leave_leaveid,
          var_leave_name
      FROM aopr_leave_def
      WHERE num_leave_corpid = :CorpId
      ORDER BY num_leave_leaveid
    `;

    const result = await executeQuery(

      query,

      {
        CorpId: payload.corpId
      }

    );

    return result.rows;

  } catch (err) {

    throw err;
  }
}


async function getLeaveByIdRepo(payload) {

  try {

    const query = `
      SELECT
          num_leave_leaveid,
          var_leave_name
      FROM aopr_leave_def
      WHERE num_leave_corpid = :CorpId
        AND num_leave_leaveid = :LeaveId
      ORDER BY num_leave_leaveid
    `;

    const result = await executeQuery(

      query,

      {
        CorpId: payload.corpId,
        LeaveId: payload.leaveId
      }

    );

    return result.rows;

  } catch (err) {

    throw err;
  }
}


async function insertLeaveRepo(data) {

  try {

    const result = await withTx(async (conn) => {

      const res = await conn.execute(

        `BEGIN
            aopr_leavemst_ins(
              :in_UserId,
              :in_CorpId,
              :in_LeaveId,
              :in_LeaveName,
              :in_Mode,
              :out_ErrorCode,
              :out_ErrorMsg
            );
         END;`,

        {

          in_UserId:
            data.userId,

          in_CorpId:
            Number(data.corpId || 0),

          in_LeaveId:
            Number(data.leaveId || 0),

          in_LeaveName:
            data.leaveName,

          in_Mode:
            Number(data.mode || 1),

          out_ErrorCode: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
          },

          out_ErrorMsg: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 2000
          }

        }

      );

      console.log(
        "insertLeaveRepo",
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
  getLeaveListRepo,
  getLeaveByIdRepo,
  insertLeaveRepo
};