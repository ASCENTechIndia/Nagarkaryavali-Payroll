const { executeQuery } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { executeProcedure } = require("../../../db/procedureExecutor");

// ✅ Get PayHeads List
const getPayHeadsList = async (body) => {
  const { ulbId } = body;

  const query = `
    SELECT 
      a.num_payheads_id AS payId,
      g.var_paysubheads_name AS subHead,
      a.var_payheads_ename AS nameE,
      a.var_payheads_mname AS nameM,
      a.num_payhead_subheadid,
      a.num_payheads_orderno,
      a.var_payheads_insby,
      a.date_payheads_insdate,
      a.var_payheads_updtby,
      a.date_payheads_updtdate,
      a.num_payheads_mergeid AS ParentId,
      b.var_payheads_mname AS ParentName
    FROM aopr_payheads_def a
    INNER JOIN aopr_paysubheads_def g
      ON a.num_payhead_subheadid = g.num_paysubheads_id
    LEFT JOIN aopr_payheads_def b
      ON a.num_payheads_mergeid = b.num_payheads_id
    WHERE a.num_payheads_ulbid = :ulbId
    ORDER BY a.num_payheads_id
  `;

  return await executeQuery(query, { ulbId });
};

const getPaySubHeadsList = async () => {
  const query = `
    SELECT 
      num_paysubheads_id,
      var_paysubheads_name
    FROM aopr_paysubheads_def
    ORDER BY num_paysubheads_id
  `;

  return await executeQuery(query);
};

const getParentPayHeadsList = async (body) => {
  const { paySubHeadId, ulbId } = body;

  // Step 1: Get SubHead Type
  const subHeadTypeQuery = `
    SELECT var_paysubheads_type
    FROM aopr_paysubheads_def
    WHERE num_paysubheads_id = :paySubHeadId
  `;

  const subHeadTypeResult = await executeQuery(subHeadTypeQuery, {
    paySubHeadId,
  });

  let subHeadType = "";

  if (subHeadTypeResult.rows && subHeadTypeResult.rows.length > 0) {
    subHeadType = subHeadTypeResult.rows[0].VAR_PAYSUBHEADS_TYPE || "";
  }

  // Step 2: Get Parent PayHeads
  const query = `
    SELECT
      var_payheads_ename,
      num_payheads_id
    FROM view_payheads
    WHERE var_paysubheads_type = :subHeadType
      AND num_payheads_mergeid IS NULL
      AND num_payheads_ulbid = :ulbId
    ORDER BY var_payheads_ename
  `;

  return await executeQuery(query, {
    subHeadType,
    ulbId,
  });
};

// ✅ Get PayHead Details By Id
const getPayHeadDetailsById = async (body) => {
  const { payHeadId } = body;

  const query = `
    SELECT
      a.num_payheads_id AS payId,
      g.var_paysubheads_name AS subHead,
      a.var_payheads_ename AS nameE,
      a.var_payheads_mname AS nameM,
      a.num_payhead_subheadid AS subpayid,
      a.num_payheads_orderno,
      a.var_payheads_insby,
      a.date_payheads_insdate,
      a.num_payheads_mergeid,
      a.var_payheads_updtby,
      a.date_payheads_updtdate
    FROM aopr_payheads_def a
    INNER JOIN aopr_paysubheads_def g
      ON a.num_payhead_subheadid = g.num_paysubheads_id
    WHERE a.num_payheads_id = :payHeadId
    ORDER BY a.num_payheads_id
  `;

  return await executeQuery(query, { payHeadId });
};

// ✅ Save / Update / Delete PayHead
const savePayHead = async (payload) => {
  console.log("📤 Repo: Execute PayHead Procedure", payload);

  const sql = `
    BEGIN
      aopr_payheads_ins(
        :IN_UserId,
        :IN_CorpId,
        :IN_PayHeadID,
        :IN_subheadid,
        :IN_ename,
        :IN_mname,
        :IN_OrderNo,
        :IN_Mode,
        :IN_Mergeid,
        :Out_ErrorCode,
        :out_ErrorMsg
      );
    END;
  `;

  const binds = {
    IN_UserId: {
      val: payload.userId,
      type: oracledb.STRING,
    },

    IN_CorpId: {
      val: Number(payload.corpId),
      type: oracledb.NUMBER,
    },

    IN_PayHeadID: {
      val: Number(payload.payHeadId || 0),
      type: oracledb.NUMBER,
    },

    IN_subheadid: {
      val: Number(payload.subHeadId),
      type: oracledb.NUMBER,
    },

    IN_ename: {
      val: payload.engName,
      type: oracledb.STRING,
    },

    IN_mname: {
      val: payload.marathiName,
      type: oracledb.STRING,
    },

    IN_OrderNo: {
      val: payload.orderNo !== undefined && payload.orderNo !== null ? Number(payload.orderNo) : null,
      type: oracledb.NUMBER,
    },

    IN_Mode: {
      val: Number(payload.mode),
      type: oracledb.NUMBER,
    },

    IN_Mergeid: {
      val: payload.mergeId !== undefined && payload.mergeId !== null ? Number(payload.mergeId) : null,
      type: oracledb.NUMBER,
    },

    Out_ErrorCode: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER,
    },

    out_ErrorMsg: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 5000,
    },
  };

  const result = await executeProcedure({ sql, binds });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.outBinds;
};

module.exports = {
  getPayHeadsList,
  getPaySubHeadsList,
  getParentPayHeadsList,
  getPayHeadDetailsById,
  savePayHead,
};
