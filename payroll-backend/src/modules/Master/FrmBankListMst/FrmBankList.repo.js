const oracledb = require("oracledb");

const { executeQuery } = require("../../../db/queryExecutor");

const { withTx } = require("../../../db/tx");


async function getBankListRepo(payload) {

  try {

    const query = `
      SELECT
          rownum,
          bankcode,
          bankname
      FROM (
          SELECT
              num_bankmst_bankid AS bankcode,
              var_bankmst_bankname AS bankname
          FROM aopr_bankmst_def
          WHERE UPPER(var_bankmst_bankname)
                LIKE '%' || UPPER(:searchText) || '%'
          ORDER BY TRIM(UPPER(var_bankmst_bankname))
      )
    `;

    const result = await executeQuery(

      query,

      {
        searchText: payload.searchText || ""
      }

    );

    return result.rows;

  } catch (err) {

    throw err;
  }
}


async function getBankByIdRepo(payload) {

  try {

    const query = `
      SELECT
          num_bankmst_bankid AS num_Bank_id,
          var_bankmst_bankname AS var_Bank_Name
      FROM aopr_bankmst_def
      WHERE num_bankmst_bankid = :bankId
    `;

    const result = await executeQuery(

      query,

      {
        bankId: payload.bankId
      }

    );

    return result.rows;

  } catch (err) {

    throw err;
  }
}


async function insertBankRepo(data) {

  try {

    const result = await withTx(async (conn) => {

      const res = await conn.execute(

        `BEGIN
            aopr_bank_ins(
            
              :in_BankId,
              :in_BankName,
              :in_UserId,
              :in_Mode,
              :out_ErrorCode,
              :out_ErrorMsg
            );
         END;`,

        {

       

          in_BankId: data.bankId,

          in_BankName: data.bankName,

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
        "insertBankRepo",
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
  getBankListRepo,
  getBankByIdRepo,
  insertBankRepo
};