const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { executeProcedure } = require("../../../db/procedureExecutor");

async function getAccountHeadDropdownRepo() {
    const sql = `
        SELECT VAR_ESEVAACCHEAD_NAME AS DISPLAY_TEXT,
               NUM_ESEVAACCHEAD_ID   AS VALUE_ID
        FROM   aopr_esevaacchead_mas
        ORDER  BY VAR_ESEVAACCHEAD_NAME
    `;
    return await executeQuery(sql, {});
}

async function getNominationDataRepo({ ulbid, empId, esevaEmpId }) {
    const sql = `
        SELECT num_nomination_empcode       AS emp_code,
               num_nomination_ulbid         AS ulbid,
               num_nomination_esevaid       AS esevaid,
               var_esevaacchead_name        AS accounthead,
               var_nomination_accounthead   AS accountheadid,
               var_nomination_nomini_alt    AS nominee,
               num_nomination_percentage    AS percentage
        FROM   aopr_nomination_det
        INNER JOIN aopr_esevaacchead_mas 
                ON NUM_ESEVAACCHEAD_ID = var_nomination_accounthead
        WHERE  num_nomination_ulbid   = :ulbid
          AND  num_nomination_empcode = :empId
          AND  num_nomination_esevaid = :esevaEmpId
    `;
    return await executeQuery(sql, { ulbid, empId, esevaEmpId });
}

async function insertNominationRepo(payload) {
    const result = await executeProcedure({
        sql: `
            BEGIN
                aopr_nomination_ins(
                    :in_UserId,
                    :in_Mode,
                    :in_empcode,
                    :in_UlbId,
                    :in_esevaid,
                    :in_str,
                    :out_ErrorCode,
                    :out_ErrorMsg
                );
            END;
        `,
        binds: {
            in_UserId: payload.userid,
            in_Mode: { val: payload.mode, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_empcode: { val: payload.empid, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_UlbId: { val: payload.ulbid, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_esevaid: { val: payload.esevaempid, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_str: payload.STR || "",
            out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
        }
    });

    if (!result.success) throw new Error(result.error);

    console.log("result: ", result);

    return {
        errorCode: result.outBinds.out_ErrorCode,
        errorMsg: result.outBinds.out_ErrorMsg
    };
}

module.exports = {
    getAccountHeadDropdownRepo,
    getNominationDataRepo,
    insertNominationRepo
};