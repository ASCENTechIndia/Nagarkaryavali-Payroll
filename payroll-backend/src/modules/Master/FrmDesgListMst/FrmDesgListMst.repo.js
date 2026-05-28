const { executeQuery } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { executeProcedure } = require("../../../db/procedureExecutor");

// ✅ Get Designation List
const getDesignationList = async () => {
  const query = `
    SELECT
      num_desigmst_designationid AS desgid,
      var_desigmst_designationname AS desgname,
      num_desigmst_washallowance AS washallow,
      num_desigmst_cleanallowance AS cleanallow
    FROM aopr_designationmst_def
    ORDER BY num_desigmst_designationid
  `;

  return await executeQuery(query);
};

// ✅ Search Designation List
const searchDesignationList = async (body) => {
  const { searchText } = body;

  let query = `
    SELECT
      num_desigmst_designationid AS desgid,
      var_desigmst_designationname AS desgname,
      num_desigmst_washallowance AS washallow,
      num_desigmst_cleanallowance AS cleanallow
    FROM aopr_designationmst_def
  `;

  const binds = {};

  if (searchText && searchText.trim() !== "") {
    query += `
      WHERE LOWER(var_desigmst_designationname)
      LIKE :searchText
    `;

    binds.searchText = `%${searchText.trim().toLowerCase()}%`;
  }

  query += `
    ORDER BY num_desigmst_designationid
  `;

  return await executeQuery(query, binds);
};

// ✅ Get Designation Details By Id
const getDesignationDetailsById = async (body) => {
  const { desgId } = body;

  const query = `
    SELECT
      num_desigmst_designationid AS desgid,
      var_desigmst_designationname AS desgname,
      num_desigmst_washallowance AS washallow,
      num_desigmst_cleanallowance AS cleanallow
    FROM aopr_designationmst_def
    WHERE num_desigmst_designationid = :desgId
    ORDER BY num_desigmst_designationid
  `;

  return await executeQuery(query, { desgId });
};

const saveDesignation = async (payload) => {
  
  const sql = `
    BEGIN
      aopr_designation_ins(
        :in_DesigId,
        :in_DesigName,
        :in_WashAllowance,
        :in_UserId,
        :in_CleanAllowance,
        :in_Mode,
        :out_ErrorCode,
        :out_ErrorMsg
      );
    END;
  `;

  const binds = {
    in_DesigId: {
      val: Number(payload.desgId || 0),
      type: oracledb.NUMBER,
    },

    in_DesigName: {
      val: payload.desgName,
      type: oracledb.STRING,
    },

    in_WashAllowance: {
      val: payload.washAllowance !== undefined && payload.washAllowance !== null ? Number(payload.washAllowance) : 0,
      type: oracledb.NUMBER,
    },

    in_UserId: {
      val: payload.userId,
      type: oracledb.STRING,
    },

    in_CleanAllowance: {
      val: payload.cleanAllowance !== undefined && payload.cleanAllowance !== null ? Number(payload.cleanAllowance) : 0,
      type: oracledb.NUMBER,
    },

    in_Mode: {
      val: Number(payload.mode),
      type: oracledb.NUMBER,
    },

    out_ErrorCode: {
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
  getDesignationList,
  searchDesignationList,
  getDesignationDetailsById,
  saveDesignation,
};
