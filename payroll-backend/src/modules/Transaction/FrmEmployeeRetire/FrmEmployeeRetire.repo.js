const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { executeProcedure } = require("../../../db/procedureExecutor");
const  getConnection  = require("../../../config/db");

async function getRetirementReasonRepo() {
    const sql = `
        SELECT var_retres_name, num_retres_id 
        FROM aopr_retirementreson_def
        ORDER BY var_retres_name
    `;
    
    const result = await executeQuery(sql);
    
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getDepartmentRepo({ ulbid }) {
    const sql = `
        SELECT deptname, deptid 
        FROM vw_deptconfig 
        WHERE ulbid = :ulbid
        ORDER BY deptname
    `;
    
    const binds = { ulbid };
    const result = await executeQuery(sql, binds);
    
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getSubDepartmentRepo({ ulbid, deptId }) {
    let sql = `
        SELECT var_deptsub_sdeptnamee, num_deptsub_id 
        FROM aopr_subdept_mas 
        WHERE num_deptsub_deptid = :deptId 
        AND num_deptsub_ulbid = :ulbid
    `;
    
    if (ulbid === "770" || ulbid === "1750") {
        sql += `
            ORDER BY TO_NUMBER(NVL(REGEXP_SUBSTR(var_deptsub_sdeptnamee, '\\(([0-9]+(\\.[0-9]+)?)\\)', 1, 1, NULL, 1), '0'))
        `;
    } else {
        sql += ` ORDER BY var_deptsub_sdeptnamee`;
    }
    
    const binds = { ulbid, deptId };
    const result = await executeQuery(sql, binds);
    
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getEmployeeListRepo({ ulbid, deptId, subDeptId }) {
    let sql = "";
    const binds = { ulbid };
    
    if (ulbid === "770" || ulbid === "1750") {
        sql = `
            SELECT var_deptslip_sequence || ' - ' || var_employee_engname AS EmpName, 
                   TO_CHAR(num_employee_empid) AS num_employee_empid 
            FROM aopr_employee_def 
            LEFT JOIN aopr_deptslip_mas ON num_deptslip_ulbid = num_employee_ulbid 
                                        AND num_deptslip_empid = num_employee_empid 
            WHERE num_employee_ulbid = :ulbid
        `;
    } else if (ulbid === "1630") {
        sql = `
            SELECT VAR_EMPLOYEE_OLDEMPNO || ' - ' || var_employee_engname AS EmpName, 
                   TO_CHAR(num_employee_empid) AS num_employee_empid 
            FROM aopr_employee_def 
            WHERE num_employee_ulbid = :ulbid
        `;
    } else {
        sql = `
            SELECT num_employee_empid || ' - ' || var_employee_engname AS EmpName, 
                   TO_CHAR(num_employee_empid) AS num_employee_empid 
            FROM aopr_employee_def 
            WHERE num_employee_ulbid = :ulbid
        `;
    }
    
    if (deptId && deptId !== "0" && deptId !== "-1") {
        sql += ` AND num_employee_deptid = :deptId`;
        binds.deptId = deptId;
    }

    if (subDeptId && subDeptId !== "0" && subDeptId !== "-1") {
        sql += ` AND num_employee_subdeptid = :subDeptId`;
        binds.subDeptId = subDeptId;
    }
    
    sql += ` ORDER BY var_employee_engname`;
    
    const result = await executeQuery(sql, binds);
    
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function saveRetirementRepo({
    userId,
    empId,
    deptId,
    subDeptId,
    reasonId,
    othReason,
    retireDate,
    ulbid,
    remark
}) {
    let bindDate = null;
    if (retireDate) {
        bindDate = new Date(retireDate);
        if (isNaN(bindDate.getTime())) {
            const parts = retireDate.split(/[-/]/);
            if (parts.length === 3) {
                bindDate = new Date(parts[2], parts[1] - 1, parts[0]);
            }
        }
    }
    
    const result = await executeProcedure({
        sql: `
            BEGIN
                aopr_retirement_ins(
                    :in_UserId,
                    :in_EmpId,
                    :in_deptid,
                    :in_Subdeptid,
                    :in_retirmentresonid,
                    :in_reasonifOther,
                    :in_retirementdate,
                    :in_UlbID,
                    :in_remark,
                    :out_ErrorCode,
                    :out_ErrorMsg,
                    :out_id
                );
            END;
        `,
        binds: {
            in_UserId: {
                val: userId,
                dir: oracledb.BIND_IN,
                type: oracledb.STRING
            },
            in_EmpId: {
                val: Number(empId),
                dir: oracledb.BIND_IN,
                type: oracledb.NUMBER
            },
            in_deptid: {
                val: Number(deptId),
                dir: oracledb.BIND_IN,
                type: oracledb.NUMBER
            },
            in_Subdeptid: {
                val: Number(subDeptId),
                dir: oracledb.BIND_IN,
                type: oracledb.NUMBER
            },
            in_retirmentresonid: {
                val: Number(reasonId),
                dir: oracledb.BIND_IN,
                type: oracledb.NUMBER
            },
            in_reasonifOther: {
                val: othReason || null,
                dir: oracledb.BIND_IN,
                type: oracledb.STRING
            },
            in_retirementdate: {
                val: bindDate,
                dir: oracledb.BIND_IN,
                type: oracledb.DATE
            },
            in_UlbID: {
                val: Number(ulbid),
                dir: oracledb.BIND_IN,
                type: oracledb.NUMBER
            },
            in_remark: {
                val: remark || null,
                dir: oracledb.BIND_IN,
                type: oracledb.STRING
            },
            out_ErrorCode: {
                dir: oracledb.BIND_OUT,
                type: oracledb.NUMBER
            },
            out_ErrorMsg: {
                dir: oracledb.BIND_OUT,
                type: oracledb.STRING,
                maxSize: 5000000
            },
            out_id: {
                dir: oracledb.BIND_OUT,
                type: oracledb.NUMBER
            }
        }
    });
    
    if (!result.success) throw new Error(result.error);
    
    return {
        errorCode: result.outBinds.out_ErrorCode,
        errorMsg: result.outBinds.out_ErrorMsg,
        outId: result.outBinds.out_id
    };
}

// async function updateBlobImageRepo({ retirementId, ulbid, blobData }) {
//     let bufferData = blobData;
//     if (typeof blobData === 'string') {
//         bufferData = Buffer.from(blobData, 'base64');
//     }

//     console.log("result retirementId: ", {retirementId})
//     console.log("result ulbid: ", {ulbid})
//     console.log("result bufferData: ", {bufferData})
    
//     const sql = `
//         UPDATE aopr_retirement_def 
//         SET blob_retirement_doc = :blobData
//         WHERE num_retirement_id = :retirementId 
//         AND num_retirement_ulbid = :ulbid
//     `;
    
//     const binds = {
//         blobData: { 
//             val: bufferData, 
//             type: oracledb.BLOB,
//             dir: oracledb.BIND_IN 
//         },
//         retirementId: { val: Number(retirementId), type: oracledb.NUMBER },
//         ulbid: { val: Number(ulbid), type: oracledb.NUMBER }
//     };
    
//     const result = await executeQuery(sql, binds);

//     console.log("result upload: ", result)
    
//     if (!result.success) throw new Error(result.error);
//     return result.rows;
// }

async function updateBlobImageRepo({ retirementId, ulbid, blobData }) {
    let bufferData = blobData;
    if (typeof blobData === 'string') {
        bufferData = Buffer.from(blobData, 'base64');
    }

    console.log("result retirementId: ", retirementId);
    console.log("result ulbid: ", ulbid);
    console.log("bufferData length: ", bufferData.length);
   
    let connection;
    try {
        connection = await getConnection();
        const checkSql = `
            SELECT num_retirement_id 
            FROM aopr_retirement_def 
            WHERE num_retirement_id = :retirementId 
            AND num_retirement_ulbid = :ulbid
        `;
        
        const checkResult = await connection.execute(checkSql, {
            retirementId: Number(retirementId),
            ulbid: Number(ulbid)
        });
        
        if (checkResult.rows.length === 0) {
            console.error("Record not found for update!");
            throw new Error(`Record with ID ${retirementId} and ULB ${ulbid} not found`);
        }
        
        console.log("Record found, updating BLOB...");
        const sql = `
            UPDATE aopr_retirement_def 
            SET blob_retirement_doc = :blobData
            WHERE num_retirement_id = :retirementId 
            AND num_retirement_ulbid = :ulbid
        `;
        
        const result = await connection.execute(sql, {
            blobData: {
                val: bufferData,
                type: oracledb.BLOB,
                dir: oracledb.BIND_IN
            },
            retirementId: {
                val: Number(retirementId),
                type: oracledb.NUMBER
            },
            ulbid: {
                val: Number(ulbid),
                type: oracledb.NUMBER
            }
        });
        
        await connection.commit();
        
        console.log("Update result:", {
            rowsAffected: result.rowsAffected,
            outBinds: result.outBinds
        });
        
        if (result.rowsAffected === 0) {
            throw new Error("No rows updated");
        }
        
        return { success: true, rowsAffected: result.rowsAffected };
        
    } catch (error) {
        console.error("Error updating BLOB:", error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
}

module.exports = {
    getRetirementReasonRepo,
    getDepartmentRepo,
    getSubDepartmentRepo,
    getEmployeeListRepo,
    saveRetirementRepo,
    updateBlobImageRepo
};