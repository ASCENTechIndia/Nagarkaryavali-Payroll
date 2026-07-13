const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { withTx } = require("../../../db/tx");

async function getDepartmentList(ulbId) {
  const sql = `
    SELECT
      d.num_deptmst_deptid AS deptid,
      d.var_deptmst_deptnamem AS deptename,
      d.var_deptmst_deptnamem AS deptmname,
      NVL(c.var_deptconfig_flag,'N') AS status
    FROM aopr_deptmst_def d
    LEFT JOIN aopr_deptconfig_mas c
      ON c.num_deptconfig_deptid = d.num_deptmst_deptid
     AND c.num_deptconfig_ulbid = :ulbId
    ORDER BY NVL(c.var_deptconfig_flag,'N') ASC,
             d.var_deptmst_deptnamem
  `;

  return executeQuery(sql, { ulbId });
}

async function getConfiguredDepartments(ulbId) {
  const sql = `
    SELECT
      d.num_deptmst_deptid AS deptid,
      d.var_deptmst_deptnamem AS deptename,
      d.var_deptmst_deptnamem AS deptmname
    FROM aopr_deptmst_def d
    INNER JOIN aopr_deptconfig_mas c
      ON c.num_deptconfig_deptid = d.num_deptmst_deptid
    WHERE c.var_deptconfig_flag='Y'
      AND c.num_deptconfig_ulbid=:ulbId
    ORDER BY d.var_deptmst_deptnamem
  `;

  return executeQuery(sql, { ulbId });
}

async function saveDepartmentConfiguration(data) {
  return withTx(async (conn) => {

    const result = await conn.execute(
      `
      BEGIN
        aopr_deptconfig_ins(
            :userId,
            :ulbId,
            :paramStr,
            :mode,
            :ipAddress,
            :source,
            :errorCode,
            :errorMsg
        );
      END;
      `,
      {
        userId: data.userId,
        ulbId: data.ulbId,
        paramStr: data.paramStr,
        mode: data.mode,
        ipAddress: data.ipAddress || "",
        source: data.source || "WEB",

        errorCode: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },

        errorMsg: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 4000,
        },
      },
      {
        autoCommit: false,
      }
    );

    return {
      errorCode: result.outBinds.errorCode,
      errorMsg: result.outBinds.errorMsg,
    };
  });
}

module.exports = {
  getDepartmentList,
  getConfiguredDepartments,
  saveDepartmentConfiguration,
};