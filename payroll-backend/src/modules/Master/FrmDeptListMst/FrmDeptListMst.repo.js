const { executeQuery } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { executeProcedure } = require("../../../db/procedureExecutor");

const getDepartmentList = async () => {
    const query = `
    SELECT 
      num_deptmst_deptid AS deptid,
      var_deptmst_deptnamee AS deptnameE,
      var_deptmst_deptnamem AS deptnameM
    FROM aopr_deptmst_def
    ORDER BY num_deptmst_deptid
  `;
    return await executeQuery(query);
};

const searchDepartmentList = async (body) => {
    const { searchText } = body;
    let query = `
    SELECT 
      num_deptmst_deptid AS deptid,
      var_deptmst_deptnamee AS deptnameE,
      var_deptmst_deptnamem AS deptnameM
    FROM aopr_deptmst_def
  `;
    const binds = {};
    if (searchText && searchText.trim() !== "") {
        query += `
      WHERE LOWER(var_deptmst_deptnamee) LIKE :searchText
         OR LOWER(var_deptmst_deptnamem) LIKE :searchText
    `;
        binds.searchText = `%${searchText.trim().toLowerCase()}%`;
    }
    query += ` ORDER BY num_deptmst_deptid `;
    return await executeQuery(query, binds);
};


const getDepartmentDetailsById = async (body) => {
    const { deptId } = body;
    const query = `
    SELECT 
      num_deptmst_deptid AS deptid,
      var_deptmst_deptnamee AS deptnameE,
      var_deptmst_deptnamem AS deptnameM
    FROM aopr_deptmst_def
    tIdWHERE num_deptmst_deptid = :dep
    ORDER BY num_deptmst_deptid
  `;
    return await executeQuery(query, { deptId });
};


const saveDepartment = async (payload) => {
    const sql = `
  BEGIN
    aopr_dept_ins(
      :in_deptid,
      :in_deptnameE,
      :in_deptnameM,
      :in_UserId,
      :in_Mode,
      :out_ErrorCode,
      :out_ErrorMsg
    );
  END;
`;

    const binds = {
        in_deptid: { val: Number(payload.deptId || 0), type: oracledb.NUMBER },
        in_deptnameE: { val: payload.deptnameE, type: oracledb.STRING },
        in_deptnameM: { val: payload.deptnameM, type: oracledb.STRING },
        in_UserId: { val: payload.userId, type: oracledb.STRING },
        in_Mode: { val: Number(payload.mode), type: oracledb.NUMBER },
        out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 5000 },
    };
    const result = await executeProcedure({ sql, binds });
    if (!result.success) throw new Error(result.error);
    return result.outBinds;
};

module.exports = {
    getDepartmentList,
    searchDepartmentList,
    getDepartmentDetailsById,
    saveDepartment,
};
