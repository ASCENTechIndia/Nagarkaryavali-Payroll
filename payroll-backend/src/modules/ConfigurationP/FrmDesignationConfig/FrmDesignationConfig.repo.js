const { executeQuery } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { withTx } = require("../../../db/tx");

// Get Corporation/ULB List
async function getCorporationListRepo() {
  try {
    const query = `
      SELECT
        corporationid,
        corporationname
      FROM admins.vw_corporation
      ORDER BY corporationname
    `;

    const result = await executeQuery(query, {});
    return result.rows;
  } catch (err) {
    throw err;
  }
}

// Get Designation Data for a ULB
async function getDesignationDataRepo(payload) {
  try {
    const { ulbId } = payload;
    
    const query = `
      SELECT 
        num_desigmst_designationid AS desigantion_id,
        var_desigmst_designationname AS desigantion_engname,
        var_desigmst_designationname AS desigantion_marname,
        'N' AS previousStatus,
        'N' AS currentStatus
      FROM aopr_designationmst_def
      LEFT JOIN aopr_desigantionconfig_mas 
        ON num_desigantionconfig_desigid = num_desigmst_designationid 
        AND num_desigantionconfig_ulbid = :ulbId
      ORDER BY num_desigmst_designationid
    `;

    const result = await executeQuery(query, { ulbId });
    return result.rows;
  } catch (err) {
    console.error("Error in getDesignationDataRepo:", err);
    throw err;
  }
}

// Get Existing Designation Configurations for a ULB
async function getDesignationConfigRepo(payload) {
  try {
    const { ulbId } = payload;
    
    const query = `
      SELECT DISTINCT
        ulbid,
        orgname,
        desig_id,
        desig_ename,
        desig_mname,
        activeflag
      FROM vw_desigconfig
      WHERE activeflag = 'Y'
        AND ulbid = :ulbId
    `;

    const result = await executeQuery(query, { ulbId });
    return result.rows;
  } catch (err) {
    console.error("Error in getDesignationConfigRepo:", err);
    throw err;
  }
}

// Save Designation Configuration - Using Stored Procedure
async function saveDesignationConfigRepo(data) {
  try {
    const result = await withTx(async (conn) => {
      // The in_str parameter should be in format: desigId#previousStatus#currentStatus$desigId#previousStatus#currentStatus$
      // This is exactly what the frontend builds with recStr
      
      const res = await conn.execute(
        `BEGIN
            AOPR_DESIGCONFIG_INS(
              :in_UserId,
              :in_Orgid,
              :in_str,
              :in_Mode,
              :in_ipaddress,
              :in_source,
              :out_ErrorCode,
              :out_ErrorMsg
            );
         END;`,
        {
          in_UserId: data.userId,
          in_Orgid: Number(data.ulbId),
          in_str: data.desigStr, // The delimited string from frontend
          in_Mode: Number(data.mode || 1),
          in_ipaddress: data.ipaddress || '127.0.0.1',
          in_source: data.source || 'WEB',
          out_ErrorCode: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER,
          },
          out_ErrorMsg: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 5000,
          },
        },
        { autoCommit: false }
      );

      const outBinds = res.outBinds;
      
      // Check if the procedure was successful
      if (outBinds.out_ErrorCode === 9999) {
        return {
          errorCode: outBinds.out_ErrorCode,
          errorMsg: outBinds.out_ErrorMsg || 'Configuration saved successfully'
        };
      } else {
        return {
          errorCode: outBinds.out_ErrorCode || -1,
          errorMsg: outBinds.out_ErrorMsg || 'An error occurred while saving'
        };
      }
    });

    return {
      success: result.errorCode === 9999,
      errorCode: result.errorCode,
      errorMsg: result.errorMsg,
    };
  } catch (err) {
    console.error("Error in saveDesignationConfigRepo:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

module.exports = {
  getCorporationListRepo,
  getDesignationDataRepo,
  getDesignationConfigRepo,
  saveDesignationConfigRepo,
};