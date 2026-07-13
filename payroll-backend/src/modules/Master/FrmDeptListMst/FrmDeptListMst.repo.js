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
    WHERE num_deptmst_deptid = :deptId
    ORDER BY num_deptmst_deptid
  `;
    return await executeQuery(query, { deptId });
};


const saveDepartment = async (payload) => {
    console.log('Saving department with payload:', payload);
    
    const sql = `
    BEGIN
        aopr_dept_ins(
            :in_UserId,        -- 1st: User ID
            :in_deptid,        -- 2nd: Department ID
            :in_deptnameE,     -- 3rd: Department Name English
            :in_deptnameM,     -- 4th: Department Name Marathi
            :in_Mode,          -- 5th: Mode
            :out_ErrorCode,    -- 6th: OUT Error Code
            :out_ErrorMsg      -- 7th: OUT Error Message
        );
    END;
    `;

    const binds = {
        in_UserId: { 
            val: String(payload.userId), 
            type: oracledb.STRING 
        },
        in_deptid: { 
            val: payload.deptId ? Number(payload.deptId) : 0, 
            type: oracledb.NUMBER 
        },
        in_deptnameE: { 
            val: payload.deptnameE.trim(), 
            type: oracledb.STRING 
        },
        in_deptnameM: { 
            val: payload.deptnameM.trim(), 
            type: oracledb.STRING 
        },
        in_Mode: { 
            val: Number(payload.mode), 
            type: oracledb.NUMBER 
        },
        out_ErrorCode: { 
            dir: oracledb.BIND_OUT, 
            type: oracledb.NUMBER 
        },
        out_ErrorMsg: { 
            dir: oracledb.BIND_OUT, 
            type: oracledb.STRING, 
            maxSize: 5000 
        },
    };

    try {
        const result = await executeProcedure({ sql, binds });
        console.log('Procedure result:', result);
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        // Extract out parameters
        const errorCode = result.outBinds?.out_ErrorCode;
        const errorMsg = result.outBinds?.out_ErrorMsg;
        
        console.log('Error Code:', errorCode);
        console.log('Error Message:', errorMsg);
        
        if (errorCode < 0 && errorCode !== -100) {
            throw new Error(errorMsg || 'Procedure returned an error');
        }
        
        return {
            out_ErrorCode: errorCode || 0,
            out_ErrorMsg: errorMsg || 'Department saved successfully'
        };
    } catch (error) {
        console.error('Save department error:', error);
        throw error;
    }
};

module.exports = {
    getDepartmentList,
    searchDepartmentList,
    getDepartmentDetailsById,
    saveDepartment,
};
