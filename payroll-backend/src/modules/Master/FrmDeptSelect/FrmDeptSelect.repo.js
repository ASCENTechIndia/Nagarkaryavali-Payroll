const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { withTx } = require("../../../db/tx");

async function getDeptSelectListRepo(payload) {
    const { ulbId, name } = payload;

  try {
    let query = `
      select deptname,deptid from vw_deptconfig where ulbid=:ulbId
    `;

    const binds = {ulbId};

    if (name) {
      query += `
        AND LOWER(deptname)
        LIKE :name
      `;

      binds.name = `%${name.toUpperCase()}%`;
    }

    query += `
       order by deptid
    `;

    const result = await executeQuery(query, binds);

    return result.rows;
  } catch (err) {
    throw err;
  }
}

async function getDepartmentOrderRepo(payload) {
  const { ulbId, deptId } = payload;

  try {
    const query = `
      SELECT DISTINCT
             num_salaryorder_deptorder
      FROM aopr_salaryorder_det
      WHERE num_salaryorder_ulbid = :ulbId
      AND num_salaryorder_deptid = :deptId
    `;

    const result = await executeQuery(query, {
      ulbId,
      deptId,
    });

    return result.rows;
  } catch (err) {
    throw err;
  }
}

async function getDesignationListRepo(payload) {
  const { ulbId } = payload;

  try {
    const query = `
      SELECT
          desig_id AS DESIGNATIONID,
          desig_ename AS DESIGNATIONNAME,
          NULL AS DESIGORDER
      FROM vw_desigconfig
      WHERE ulbid = :ulbId
      ORDER BY desig_id
    `;

    const result = await executeQuery(query, {
      ulbId,
    });

    return result.rows;
  } catch (err) {
    throw err;
  }
}

async function getExistingDesignationOrderRepo(payload) {
  const { ulbId, deptId } = payload;

  try {
    const query = `
      SELECT
          desig_id,
          num_salaryorder_desigorder AS DESIGORDER
      FROM vw_desigconfig
      INNER JOIN aopr_salaryorder_det
          ON num_salaryorder_ulbid = ulbid
         AND num_salaryorder_desigid = desig_id
      WHERE ulbid = :ulbId
      AND num_salaryorder_deptid = :deptId
      ORDER BY num_salaryorder_desigorder
    `;

    const result = await executeQuery(query, {
      ulbId,
      deptId,
    });

    return result.rows;
  } catch (err) {
    throw err;
  }
}

async function saveDepartmentOrderRepo(payload) {
  try {
    const result = await withTx(async (conn) => {
      const res = await conn.execute(
        `
        BEGIN
            aopr_empsalaryorder_ins(
                :in_userid,
                :in_ulbid,
                :in_deptid,
                :in_deptorder,
                :in_str,
                :out_errorcode,
                :out_errormsg
            );
        END;
        `,
        {
          in_userid: payload.userId,

          in_ulbid: payload.ulbId,

          in_deptid: payload.deptId,

          in_deptorder: payload.deptOrder,

          in_str: payload.desigStr,

          out_errorcode: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER,
          },

          out_errormsg: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 5000,
          },
        }
      );

      return res.outBinds;
    });

    return {
      success: true,
      errorCode: result.out_errorcode,
      errorMsg: result.out_errormsg,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}

module.exports = {
  getDeptSelectListRepo,
  getDepartmentOrderRepo,
  getDesignationListRepo,
  getExistingDesignationOrderRepo,
  saveDepartmentOrderRepo,
};
