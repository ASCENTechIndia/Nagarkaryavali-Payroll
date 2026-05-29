const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { withTx } = require("../../../db/tx");

// ======================================================
// CORPORATION LIST
// ======================================================

async function getCorporationListRepo() {

  const query = `
    SELECT
      CORPORATIONID AS id_value,
      CORPORATIONNAME AS display_text
    FROM prop.vw_corporation
    ORDER BY CORPORATIONNAME
  `;

  const result = await executeQuery(query, {});

  return result.rows;
}

// ======================================================
// ALL BRANCHES
// ======================================================

async function getBranchListRepo(payload) {

  const query = `
    SELECT
       num_Branchmst_Branchid,
       var_Branchmst_Branchname
    FROM aopr_Branchmst_def
    LEFT JOIN aopr_Branchconfig_def c
      ON num_Branchconfig_Branchid = num_Branchmst_Branchid
     AND c.num_Branchconfig_ulbid = :UlbId
    ORDER BY var_Branchconfig_activeflag
  `;

  const result = await executeQuery(
    query,
    {
      UlbId: payload.ulbId
    }
  );

  return result.rows;
}

// ======================================================
// CONFIGURED BRANCHES
// ======================================================

async function getConfiguredBranchRepo(payload) {

  const query = `
    SELECT
       num_Branchconfig_Branchid AS confiBranch_id,
       var_Branchmst_Branchname
    FROM aopr_Branchmst_def
    INNER JOIN aopr_Branchconfig_def cbm
      ON cbm.num_Branchconfig_Branchid = num_Branchmst_Branchid
    WHERE cbm.var_Branchconfig_activeflag = 'Y'
      AND cbm.num_Branchconfig_ulbid = :UlbId
  `;

  const result = await executeQuery(
    query,
    {
      UlbId: payload.ulbId
    }
  );

  return result.rows;
}

// ======================================================
// SAVE BRANCH CONFIGURATION
// ======================================================

async function saveBranchConfigurationRepo(data) {

  try {

    const result = await withTx(async (conn) => {

      const res = await conn.execute(

        `BEGIN
            aopr_BranchConfig_ins(
              :in_UserId,
              :in_ulbid,
              :in_BranchStr,
              :in_Mode,
              :Out_ErrorCode,
              :Out_ErrorMsg
            );
         END;`,

        {

          in_UserId: data.userId,

          in_ulbid: Number(data.ulbId),

          in_BranchStr: data.branchStr,

          in_Mode: Number(data.mode),

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

      errorCode: result.Out_ErrorCode,

      errorMsg: result.Out_ErrorMsg

    };

  } catch (err) {

    return {

      success: false,

      error: err.message

    };
  }
}

module.exports = {
  getCorporationListRepo,
  getBranchListRepo,
  getConfiguredBranchRepo,
  saveBranchConfigurationRepo
};