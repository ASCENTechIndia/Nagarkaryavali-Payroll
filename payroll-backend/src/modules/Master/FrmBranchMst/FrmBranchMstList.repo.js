const oracledb = require("oracledb");

const { executeQuery } = require("../../../db/queryExecutor");

const { withTx } = require("../../../db/tx");

async function getBankListRepo(payload) {

  try {

    const query = `
      SELECT
        bankname,
        bankid
      FROM vw_bankconf
      WHERE ulbid = :ulbid
    `;

    const result = await executeQuery(

      query,

      {
        ulbid: payload.ulbid
      }

    );

    return result.rows;

  } catch (err) {

    throw err;
  }
}


async function getBranchListRepo(payload) {

  try {

    const query = `
      SELECT
          rownum,
          BranchId,
          BranchName
      FROM (
          SELECT
              num_branchmst_branchid AS BranchId,
              var_branchmst_branchname AS BranchName
          FROM aopr_branchmst_def
          WHERE num_branchmst_bankid = :bankId
            AND UPPER(var_branchmst_branchname)
                LIKE '%' || UPPER(:searchText) || '%'
      )
    `;

    const result = await executeQuery(

      query,

      {
        bankId: payload.bankId,
        searchText: payload.searchText || ""
      }

    );

    return result.rows;

  } catch (err) {

    throw err;
  }
}


async function getBranchByIdRepo(payload) {

  try {

    const query = `
      SELECT
          num_branchmst_bankid AS BankId,
          num_branchmst_branchid AS BranchId,
          var_branchmst_branchname AS BranchName
      FROM aopr_branchmst_def
      WHERE num_branchmst_branchid = :branchId
    `;

    const result = await executeQuery(

      query,

      {
        branchId: payload.branchId
      }

    );

    return result.rows;

  } catch (err) {

    throw err;
  }
}


async function insertBranchRepo(data) {

  try {

    const result = await withTx(async (conn) => {

      const res = await conn.execute(

        `BEGIN
            aopr_bankbranch_ins(
              :in_bankbranch_id,
              :in_bankbranch_name,
              :in_bankbranch_bankid,
              :in_userid,
              :in_mode,
              :out_errorcode,
              :out_errormsg
            );
         END;`,

        {

          in_bankbranch_id:
            data.branchId,

          in_bankbranch_name:
            data.branchName,

          in_bankbranch_bankid:
            data.bankId,

          in_userid:
            data.userId,

          in_mode:
            data.mode,

          out_errorcode: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
          },

          out_errormsg: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 1000
          }

        }

      );

      console.log(
        "insertBranchRepo",
        res
      );

      return res.outBinds;

    });

    return {

      success: true,

      errorCode: result.out_errorcode,

      errorMsg: result.out_errormsg

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
  getBranchListRepo,
  getBranchByIdRepo,
  insertBranchRepo
};