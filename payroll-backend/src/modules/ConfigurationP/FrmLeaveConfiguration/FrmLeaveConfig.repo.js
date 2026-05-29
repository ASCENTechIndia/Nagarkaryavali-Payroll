const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { withTx } = require("../../../db/tx");

// ======================================================
// CONFIGURED LEAVE LIST
// ======================================================

async function getConfiguredLeaveRepo(payload) {

  try {

    const query = `
      SELECT
         num_leavenconfig_leaveid AS leaveconfig,
         var_leave_name
      FROM aopr_leave_def
      INNER JOIN aopr_leaveconfig_def c
        ON c.num_leavenconfig_leaveid = num_leave_leaveid
      WHERE c.var_leaveconfig_activeflag = 'Y'
        AND c.num_leaveconfig_ulbid = :UlbId
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

// ======================================================
// ALL LEAVE LIST
// ======================================================

async function getLeaveListRepo(payload) {

  try {

    const query = `
      SELECT
         num_leave_leaveid,
         var_leave_name
      FROM aopr_leave_def
      LEFT JOIN aopr_leaveconfig_def c
        ON c.num_leavenconfig_leaveid = num_leave_leaveid
       AND c.num_leaveconfig_ulbid = :UlbId
      ORDER BY var_leaveconfig_activeflag
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

// ======================================================
// SAVE LEAVE CONFIGURATION
// ======================================================

async function saveLeaveConfigurationRepo(data) {

  try {

    const result = await withTx(async (conn) => {

      const res = await conn.execute(

        `BEGIN
            aopr_leaveconf_ins(
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
            data.leaveStr,

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

      console.log(
        "saveLeaveConfigurationRepo",
        res
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
  getConfiguredLeaveRepo,
  getLeaveListRepo,
  saveLeaveConfigurationRepo
};