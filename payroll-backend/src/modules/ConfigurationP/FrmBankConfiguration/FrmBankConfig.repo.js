const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { withTx } = require("../../../db/tx");

// ======================================================
// CONFIGURED BANK LIST
// ======================================================

async function getConfiguredBankRepo(payload) {

  const query = `
    SELECT
       num_bankconfig_bankid AS confiBank_id,
       var_bankmst_bankname
    FROM aopr_bankmst_def
    INNER JOIN aopr_bankconfig_def cbm
      ON cbm.num_bankconfig_bankid = num_bankmst_bankid
    WHERE cbm.var_Bankconfig_activeflag = 'Y'
      AND cbm.num_Bankconfig_ulbid = :UlbId
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
// ALL BANK LIST
// ======================================================

async function getBankListRepo(payload) {

  const query = `
    SELECT
       num_bankmst_bankid,
       var_bankmst_bankname
    FROM aopr_bankmst_def
    LEFT JOIN aopr_bankconfig_def c
      ON num_bankconfig_bankid = num_bankmst_bankid
     AND c.num_bankconfig_ulbid = :UlbId
    ORDER BY var_bankconfig_activeflag
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
// SAVE BANK CONFIGURATION
// ======================================================

async function saveBankConfigurationRepo(data) {

  try {

    const result = await withTx(async (conn) => {

      const res = await conn.execute(

        `BEGIN
            aopr_BankConfig_ins(
              :in_UserId,
              :in_ulbid,
              :in_BankStr,
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

          in_BankStr:
            data.bankStr,

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
        "saveBankConfigurationRepo",
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
  getConfiguredBankRepo,
  getBankListRepo,
  saveBankConfigurationRepo
};