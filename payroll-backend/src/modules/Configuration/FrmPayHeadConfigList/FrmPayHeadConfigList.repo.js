const { executeQuery } = require("../../../db/queryExecutor");
const { withTx } = require("../../../db/tx");
const oracledb = require("oracledb");



// ✅ Get PayHead Dropdown List
async function getPayHeadListRepo(payload) {
  try {
    const query = `
      SELECT
        var_payheads_ename,
        num_payheads_id
      FROM aopr_PayHeads_def
      WHERE num_payheads_ulbid = :ulbId
      ORDER BY var_payheads_ename
    `;

    const result = await executeQuery(query, {
      ulbId: payload.ulbId,
    });

    return result.rows;
  } catch (err) {
    throw err;
  }
}

// ✅ Get PayHead Configuration List
async function getPayHeadConfigListRepo(payload) {
  try {
    let query = `
      SELECT
        a.num_payheadsdtl_transid AS payTranId,
        a.num_payheadsdtl_id,
        p.var_payheads_ename,
        a.var_payheadsdtl_calctype,
        a.num_payheadsdtl_categoryid AS categoryId,
        cm.var_category_name AS categoryName,
        a.num_payheadsdtl_value,
        a.num_payheadsdtl_desigid,
        d.var_desigmst_designationname,
        a.num_payheadsdtl_gradeid,
        g.var_grademst_gradename,
        a.var_payheadsdtl_insby,
        a.date_payheadsdtl_insdate,
        a.var_payheadsdtl_updtby,
        a.num_payheadsdtl_maxlimit,
        a.date_payheadsdtl_updtdate
      FROM aopr_payheadsdtl_def a
      INNER JOIN aopr_PayHeads_def p
        ON a.num_payheadsdtl_id = p.num_payheads_id
       AND a.num_payheadsdtl_ulbid = p.num_payheads_ulbid
      INNER JOIN aopr_category_mas cm
        ON a.num_payheadsdtl_categoryid = cm.num_category_id
      INNER JOIN aopr_designationmst_def d
        ON a.num_payheadsdtl_desigid = d.num_desigmst_designationid
      INNER JOIN aopr_grademst_def g
        ON a.num_payheadsdtl_gradeid = g.num_grademst_gradeid
      WHERE a.num_payheadsdtl_categoryid = :categoryId
        AND a.num_payheadsdtl_ulbid = :ulbId
    `;

    const binds = {
      categoryId: payload.categoryId,
      ulbId: payload.ulbId,
    };

    if (payload.payHeadId && payload.payHeadId !== 0) {
      query += ` AND a.num_payheadsdtl_id = :payHeadId`;
      binds.payHeadId = payload.payHeadId;
    }

    if (payload.desigId && payload.desigId !== 0) {
      query += ` AND a.num_payheadsdtl_desigid = :desigId`;
      binds.desigId = payload.desigId;
    }

    if (payload.gradeId && payload.gradeId !== 0) {
      query += ` AND a.num_payheadsdtl_gradeid = :gradeId`;
      binds.gradeId = payload.gradeId;
    }

    query += ` ORDER BY a.num_payheadsdtl_id DESC`;

    const result = await executeQuery(query, binds);

    return result.rows;
  } catch (err) {
    throw err;
  }
}

async function getPayHeadDropdownRepo(payload) {
  try {
    const query = `
      SELECT
        var_payheads_ename,
        num_payheads_id
      FROM aopr_payheads_def
      WHERE num_payheads_ulbid = :ulbId
      ORDER BY var_payheads_ename
    `;

    const result = await executeQuery(query, {
      ulbId: payload.ulbId,
    });

    return result.rows;
  } catch (err) {
    throw err;
  }
}

async function getPayHeadConfigDetailsRepo(payload) {
  try {
    const query = `
      SELECT
        a.num_payheadsdtl_id,
        p.var_payheads_ename,
        a.var_payheadsdtl_calctype,
        a.num_payheadsdtl_value,
        a.num_payheadsdtl_desigid,
        a.num_payheadsdtl_categoryid AS categoryId,
        cm.var_category_name AS categoryName,
        d.var_desigmst_designationname,
        a.num_payheadsdtl_gradeid,
        g.var_grademst_gradename,
        a.var_payheadsdtl_insby,
        a.date_payheadsdtl_insdate,
        a.var_payheadsdtl_updtby,
        a.date_payheadsdtl_updtdate,
        a.num_payheadsdtl_maxlimit
      FROM aopr_payheadsdtl_def a
      INNER JOIN aopr_PayHeads_def p
        ON a.num_payheadsdtl_id = p.num_payheads_id
       AND a.num_payheadsdtl_ulbid = p.num_payheads_ulbid
      INNER JOIN aopr_category_mas cm
        ON a.num_payheadsdtl_categoryid = cm.num_category_id
      INNER JOIN aopr_designationmst_def d
        ON a.num_payheadsdtl_desigid = d.num_desigmst_designationid
      INNER JOIN aopr_grademst_def g
        ON a.num_payheadsdtl_gradeid = g.num_grademst_gradeid
      WHERE a.num_payheadsdtl_categoryid = :categoryId
        AND a.num_payheadsdtl_id = :payHeadId
        AND a.num_payheadsdtl_desigid = :desigId
        AND a.num_payheadsdtl_gradeid = :gradeId
      ORDER BY a.num_payheadsdtl_id DESC
    `;

    const result = await executeQuery(query, {
      categoryId: payload.categoryId,
      payHeadId: payload.payHeadId,
      desigId: payload.desigId,
      gradeId: payload.gradeId,
    });

    return result.rows;
  } catch (err) {
    throw err;
  }
}

async function savePayHeadConfigRepo(data) {
  try {
    const result = await withTx(async (conn) => {
      const res = await conn.execute(
        `BEGIN
            aopr_payheadsdtl_ins(
              :IN_UserId,
              :IN_PayHeadID,
              :IN_CalcType,
              :IN_Value,
              :IN_STR1,
              :IN_STR2,
              :IN_STR3,
              :IN_STR4,
              :IN_STR5,
              :IN_STR6,
              :IN_Mode,
              :IN_transid,
              :IN_maxlimit,
              :IN_UlbID,
              :Out_ErrorCode,
              :out_ErrorMsg
            );
         END;`,

        {
          IN_UserId: data.userId,

          IN_PayHeadID: data.payHeadId,

          IN_CalcType: data.calcType,

          IN_Value: data.value,

          IN_STR1: data.str1 || null,

          IN_STR2: data.str2 || null,

          IN_STR3: data.str3 || null,

          IN_STR4: data.str4 || null,

          IN_STR5: data.str5 || null,

          IN_STR6: data.str6 || null,

          IN_Mode: data.mode,

          IN_transid: data.tranId || null,

          IN_maxlimit: data.maxLimit || null,

          IN_UlbID: data.ulbId,

          Out_ErrorCode: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER,
          },

          out_ErrorMsg: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 5000,
          },
        },
      );

      console.log("savePayHeadConfigRepo", res);

      return res.outBinds;
    });

    return {
      success: true,
      errorCode: result.Out_ErrorCode,
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
  getPayHeadListRepo,
  getPayHeadConfigListRepo,
  getPayHeadDropdownRepo,
  getPayHeadConfigDetailsRepo,
  savePayHeadConfigRepo,
};
