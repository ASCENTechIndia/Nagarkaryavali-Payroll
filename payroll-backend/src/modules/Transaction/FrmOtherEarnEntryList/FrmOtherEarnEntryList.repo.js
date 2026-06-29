const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { executeProcedure } = require("../../../db/procedureExecutor");

async function getOtherEarningListRepo() {
    const sql = `
        SELECT 
            det.num_otherearnings_id AS id,
            emp.var_employee_engname AS emp_name,
            emp.num_employee_empid AS empid,
            ph.var_otherpayheads_ename AS payhead_name,
            dept.deptname AS department,
            desig.desig_ename AS designation,
            det.num_otherearnings_amount AS amount,
            det.dat_otherearnings_amtdate AS amt_date,
            det.var_otherearnings_remark AS other_remark
        FROM 
            aopr_employee_def emp
            INNER JOIN aopr_otherearnings_det det 
                ON det.num_otherearnings_empid = emp.num_employee_empid 
                AND emp.num_employee_ulbid = det.num_otherearnings_ulbid 
            INNER JOIN aopr_otherpayheads_def ph 
                ON ph.num_otherpayheads_id = det.num_otherearnings_payheadid 
            INNER JOIN vw_deptconfig dept 
                ON emp.num_employee_deptid = dept.deptid  
                AND dept.ulbid = emp.num_employee_ulbid 
            INNER JOIN vw_desigconfig desig 
                ON emp.num_employee_desigid = desig.desig_id 
                AND desig.ulbid = emp.num_employee_ulbid
    `;
    
    const result = await executeQuery(sql);
    
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getEarningHeadListRepo({ ulbid }) {
    const sql = `
        SELECT var_otherpayheads_ename, num_otherpayheads_id
        FROM aopr_otherpayheads_def
        WHERE num_otherpayheads_ulbid = :ulbid
        ORDER BY var_otherpayheads_ename
    `;
    
    const binds = { ulbid };
    const result = await executeQuery(sql, binds);
    
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getEmployeeListRepo({ ulbid, deptId, desgnId }) {
    let sql = `
        SELECT num_employee_empid || ' - ' || var_employee_engname AS EmpName,
               TO_CHAR(num_employee_empid) AS num_employee_empid
        FROM aopr_employee_def
        WHERE num_employee_ulbid = :ulbid
          AND NVL(var_employee_sevanivflag, 'N') <> 'Y'
    `;
    
    const binds = { ulbid };
    
    if (deptId && deptId !== "0" && deptId !== "-1") {
        sql += ` AND num_employee_deptid = :deptId`;
        binds.deptId = deptId;
    }
    
    if (desgnId && desgnId !== "0" && desgnId !== "-1") {
        sql += ` AND num_employee_desigid = :desgnId`;
        binds.desgnId = desgnId;
    }
    
    sql += ` ORDER BY var_employee_engname`;
    
    const result = await executeQuery(sql, binds);
    
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getEmployeeDetailsRepo({ ulbid, empId }) {
    const sql = `
        SELECT num_employee_deptid, num_employee_desigid
        FROM aopr_employee_def
        WHERE num_employee_ulbid = :ulbid
          AND num_employee_empid = :empId
    `;
    
    const binds = { ulbid, empId };
    const result = await executeQuery(sql, binds);
    
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getEditRecordRepo({ ulbid, empId, detId }) {
    const sql = `
        SELECT 
            emp.var_employee_engname AS emp_name,
            emp.num_employee_empid AS empid,
            ph.num_otherpayheads_id AS payhead_id,
            ph.var_otherpayheads_ename AS payhead_name,
            emp.num_employee_deptid AS department,
            emp.num_employee_desigid AS designation,
            det.num_otherearnings_amount AS amount,
            det.dat_otherearnings_amtdate AS amt_date,
            det.var_otherearnings_remark AS other_remark,
            det.num_otherearnings_id AS det_id
        FROM aopr_employee_def emp
        INNER JOIN aopr_otherearnings_det det 
            ON det.num_otherearnings_empid = emp.num_employee_empid  
            AND det.num_otherearnings_ulbid = emp.num_employee_ulbid 
        INNER JOIN aopr_otherpayheads_def ph 
            ON ph.num_otherpayheads_id = det.num_otherearnings_payheadid 
            AND ph.num_otherpayheads_ulbid = emp.num_employee_ulbid 
        WHERE emp.num_employee_ulbid = :ulbid
          AND emp.num_employee_empid = :empId
          AND det.num_otherearnings_id = :detId
    `;
    
    const binds = { ulbid, empId, detId };
    const result = await executeQuery(sql, binds);
    
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

// async function saveOtherEarningRepo({
//     userId,
//     empId,
//     earnId,
//     payheadId,
//     amount,
//     ulbid,
//     deptId,
//     desigId,
//     amtDate,
//     remark,
//     mode
// }) {
    
//     const result = await executeProcedure({
//         sql: `
//             BEGIN
//                 aopr_otherearnings_ins(
//                     :in_userid,
//                     :in_empid,
//                     :in_earningid,
//                     :in_payheadid,
//                     :in_amount,
//                     :in_ulbid,
//                     :in_deptid,
//                     :in_desigid,
//                     :in_amtdate,
//                     :in_remark,
//                     :in_mode,
//                     :out_ErrorCode,
//                     :out_ErrorMsg
//                 );
//             END;
//         `,
//         binds: {
//             in_userid: { val: userId, dir: oracledb.BIND_IN, type: oracledb.STRING },
//             in_empid: { val: parseInt(empId), dir: oracledb.BIND_IN, type: oracledb.NUMBER },
//             in_earningid: { val: parseInt(earnId) || 0, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
//             in_payheadid: { val: parseInt(payheadId), dir: oracledb.BIND_IN, type: oracledb.NUMBER },
//             in_amount: { val: parseFloat(amount), dir: oracledb.BIND_IN, type: oracledb.NUMBER },
//             in_ulbid: { val: parseInt(ulbid), dir: oracledb.BIND_IN, type: oracledb.NUMBER },
//             in_deptid: { val: parseInt(deptId), dir: oracledb.BIND_IN, type: oracledb.NUMBER },
//             in_desigid: { val: parseInt(desigId), dir: oracledb.BIND_IN, type: oracledb.NUMBER },
//             in_amtdate: { val: amtDate, dir: oracledb.BIND_IN, type: oracledb.DATE },
//             in_remark: { val: remark, dir: oracledb.BIND_IN, type: oracledb.STRING },
//             in_mode: { val: parseInt(mode), dir: oracledb.BIND_IN, type: oracledb.NUMBER },
//             out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
//             out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 5000000 }
//         }
//     });
    
//     if (!result.success) throw new Error(result.error);
    
//     return {
//         errorCode: result.outBinds.out_errorcode,
//         errorMsg: result.outBinds.out_errormsg
//     };
// }


async function saveOtherEarningRepo({
    userId,
    empId,
    earnId,
    payheadId,
    amount,
    ulbid,
    deptId,
    desigId,
    amtDate,
    remark,
    mode
}) {

    let bindDate = null;

    if (amtDate) {
        bindDate = new Date(amtDate);

        if (isNaN(bindDate.getTime())) {
            const parts = amtDate.split("-");

            if (parts.length === 3) {
                const months = {
                    JAN: 0,
                    FEB: 1,
                    MAR: 2,
                    APR: 3,
                    MAY: 4,
                    JUN: 5,
                    JUL: 6,
                    AUG: 7,
                    SEP: 8,
                    OCT: 9,
                    NOV: 10,
                    DEC: 11
                };

                bindDate = new Date(
                    Number(parts[2]),
                    months[parts[1].toUpperCase()],
                    Number(parts[0])
                );
            }
        }
    }

    const result = await executeProcedure({
        sql: `
            BEGIN
                aopr_otherearnings_ins(
                    :in_userid,
                    :in_empid,
                    :in_earningid,
                    :in_payheadid,
                    :in_amount,
                    :in_ulbid,
                    :in_deptid,
                    :in_desigid,
                    :in_amtdate,
                    :in_remark,
                    :in_mode,
                    :out_ErrorCode,
                    :out_ErrorMsg
                );
            END;
        `,
        binds: {
            in_userid: {
                val: userId,
                dir: oracledb.BIND_IN,
                type: oracledb.STRING
            },

            in_empid: {
                val: Number(empId),
                dir: oracledb.BIND_IN,
                type: oracledb.NUMBER
            },

            in_earningid: {
                val: Number(earnId) || 0,
                dir: oracledb.BIND_IN,
                type: oracledb.NUMBER
            },

            in_payheadid: {
                val: Number(payheadId),
                dir: oracledb.BIND_IN,
                type: oracledb.NUMBER
            },

            in_amount: {
                val: Number(amount),
                dir: oracledb.BIND_IN,
                type: oracledb.NUMBER
            },

            in_ulbid: {
                val: Number(ulbid),
                dir: oracledb.BIND_IN,
                type: oracledb.NUMBER
            },

            in_deptid: {
                val: Number(deptId),
                dir: oracledb.BIND_IN,
                type: oracledb.NUMBER
            },

            in_desigid: {
                val: Number(desigId),
                dir: oracledb.BIND_IN,
                type: oracledb.NUMBER
            },

            in_amtdate: {
                val: bindDate,
                dir: oracledb.BIND_IN,
                type: oracledb.DATE
            },

            in_remark: {
                val: remark,
                dir: oracledb.BIND_IN,
                type: oracledb.STRING
            },

            in_mode: {
                val: Number(mode),
                dir: oracledb.BIND_IN,
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
            }
        }
    });

    if (!result.success) {
        throw new Error(result.error);
    }

    return {
        errorCode: result.outBinds.out_ErrorCode,
        errorMsg: result.outBinds.out_ErrorMsg
    };
}


module.exports = {
    getOtherEarningListRepo,
    getEarningHeadListRepo,
    getEmployeeListRepo,
    getEmployeeDetailsRepo,
    getEditRecordRepo,
    saveOtherEarningRepo
};