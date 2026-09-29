const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { executeProcedure } = require("../../../db/procedureExecutor");

async function getEducationalInfoRepo({ ulbid, empId, esevaEmpId }) {
    const sql = `
        SELECT num_educationinfo_esevaid    AS esevaid,
               num_educationinfo_empcode    AS emp_code,
               num_educationinfo_ulbid      AS ulbid,
               var_educationinfo_degree     AS degree,
               var_educationinfo_university AS university,
               dat_educationinfo_passyear   AS passyear
        FROM   aopr_educationinfo_det
        WHERE  num_educationinfo_ulbid   = :ulbid
          AND  num_educationinfo_empcode = :empId
          AND  num_educationinfo_esevaid = :esevaEmpId
    `;
    return await executeQuery(sql, { ulbid, empId, esevaEmpId });
}

async function getAdditionalTrainingRepo({ ulbid, empId, esevaEmpId }) {
    const sql = `
        SELECT num_at_esevaid    AS esevaid,
               num_at_empcode    AS emp_code,
               num_at_ulbid      AS ulbid,
               var_at_coursename AS coursename,
               var_at_orgdetails AS orgdetails,
               dat_at_commenceda AS commencedate
        FROM   aopr_additiontraining_det
        WHERE  num_at_ulbid   = :ulbid
          AND  num_at_empcode = :empId
          AND  num_at_esevaid = :esevaEmpId
    `;
    return await executeQuery(sql, { ulbid, empId, esevaEmpId });
}

async function getProfessionalTrainingRepo({ ulbid, empId, esevaEmpId }) {
    const sql = `
        SELECT num_pttraining_esevaid    AS esevaid,
               num_pttraining_empcode    AS emp_code,
               num_pttraining_ulbid      AS ulbid,
               var_pttraining_degree     AS degree,
               var_pttraining_university AS university,
               dat_pttraining_passyear   AS passyear
        FROM   aopr_pttraining_det
        WHERE  num_pttraining_ulbid   = :ulbid
          AND  num_pttraining_empcode = :empId
          AND  num_pttraining_esevaid = :esevaEmpId
    `;
    return await executeQuery(sql, { ulbid, empId, esevaEmpId });
}


async function insertEducationalInfoRepo(payload) {
    const result = await executeProcedure({
        sql: `
            BEGIN
                aoms_educationinfo_ins(
                    :in_userid,
                    :in_ulbid,
                    :in_esevaid,
                    :in_empcode,
                    :in_str,
                    :in_strAT,
                    :in_StrPT,
                    :in_mode,
                    :out_ErrorCode,
                    :out_ErrorMsg
                );
            END;
        `,
        binds: {
            in_userid: payload.userid,
            in_ulbid: { val: payload.ulbid, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_esevaid: { val: payload.esevaempid, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_empcode: String(payload.empid),
            in_str: payload.STR || "",
            in_strAT: payload.STR_AT || "",
            in_StrPT: payload.STR_PT || "",
            in_mode: { val: payload.mode, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
        }
    });

    if (!result.success) throw new Error(result.error);

    console.log("result", result);

    return {
        errorCode: result.outBinds.out_ErrorCode,
        errorMsg: result.outBinds.out_ErrorMsg
    };
}

module.exports = {
    getEducationalInfoRepo,
    getAdditionalTrainingRepo,
    getProfessionalTrainingRepo,
    insertEducationalInfoRepo
};