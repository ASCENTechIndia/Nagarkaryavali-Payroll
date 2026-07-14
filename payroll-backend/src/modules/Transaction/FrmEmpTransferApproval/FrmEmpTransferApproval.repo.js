const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { executeProcedure } = require("../../../db/procedureExecutor");

async function getEmpTransferListRepo(ulbid) {
    const sql = `
        SELECT num_emptrans_empid AS emptransid,
               num_emptrans_id AS empid,
               var_employee_marname AS empname,
               oldg.var_desigmst_designationname AS olddesignation,
               newg.var_desigmst_designationname AS newdesignation,
               oldd.var_deptmst_deptnamee AS currentdpt,
               newd.var_deptmst_deptnamee AS newdept,
               dat_emptrans_orderdate AS orderdt,
               var_emptrans_ordernumber AS ordeno
        FROM aopr_EmpTransfer_MAS
        INNER JOIN aopr_employee_def ON num_employee_empid = num_emptrans_empid AND num_employee_ulbid = num_emptrans_ulbid
        INNER JOIN aopr_deptmst_def oldd ON oldd.num_deptmst_deptid = num_emptrans_deptid
        INNER JOIN aopr_deptmst_def newd ON newd.num_deptmst_deptid = num_emptrans_newdeptid
        INNER JOIN aopr_designationmst_def oldg ON oldg.num_desigmst_designationid = num_emptrans_desigid
        INNER JOIN aopr_designationmst_def newg ON newg.num_desigmst_designationid = num_emptrans_newdesigid
        WHERE var_emptrans_status = 'P' AND num_emptrans_ulbid = :ulbid
    `;
    return (await executeQuery(sql, { ulbid })).rows;
}

async function getTransferTypesRepo() {
    const sql = `SELECT num_transfertype_transid, var_transfertype_transfername FROM aopr_TransferType_mas`;
    return (await executeQuery(sql, {})).rows;
}

async function getEmpTransferDetailsRepo({ empId, empTransId, ulbid }) {
    const sql = `
        SELECT num_emptrans_empid AS empid,
               var_employee_engname AS empname,
               num_emptrans_newdeptid,
               num_emptrans_newdesigid,
               num_emptrans_transftypeid,
               num_emptrans_newpaybandid,
               dat_emptrans_orderdate,
               var_emptrans_ordernumber,
               var_deptslip_sequence AS slipno
        FROM aopr_emptransfer_mas
        INNER JOIN aopr_employee_def ON num_employee_empid = num_emptrans_empid
        LEFT JOIN aopr_deptslip_mas ON num_deptslip_empid = num_employee_empid AND num_deptslip_ulbid = num_employee_ulbid
        WHERE num_employee_ulbid = :ulbid
          AND num_emptrans_empid = :empId
          AND num_emptrans_id = :empTransId
    `;
    return (await executeQuery(sql, { ulbid, empId, empTransId })).rows[0];
}

async function saveEmpTransferRepo(payload) {
    const result = await executeProcedure({
        sql: `
            BEGIN
                aopr_EmpTransfer_ins(
                    :in_UserId, :in_EmpId, :in_EmpNumber, :in_deptid, :in_desigid,
                    :in_PayBand, :in_dateofJoin, :in_periodwdept, :in_newdeptid,
                    :in_newdesigid, :in_transftypeid, :in_newPayBandid, :in_orderdate,
                    :in_ordernumber, :in_ULBID, :in_emptransID, :in_mode, :in_status,
                    :in_jobchart, :in_jobtableno, :in_jobchartnew, :in_jobtablenonew,
                    :out_ErrorCode, :out_ErrorMsg, :out_trasferID
                );
            END;
        `,
        binds: {
            in_UserId: payload.userId,
            in_EmpId: payload.empId,
            in_EmpNumber: payload.empNumber,
            in_deptid: payload.deptId,
            in_desigid: payload.desigId,
            in_PayBand: payload.payBand,
            in_dateofJoin: payload.dateOfJoin,
            in_periodwdept: payload.periodWithDept,
            in_newdeptid: payload.newDeptId,
            in_newdesigid: payload.newDesigId,
            in_transftypeid: payload.transferTypeId,
            in_newPayBandid: payload.newPayBandId,
            in_orderdate: payload.orderDate,
            in_ordernumber: payload.orderNumber,
            in_ULBID: payload.ulbid,
            in_emptransID: payload.empTransId,
            in_mode: payload.mode,
            in_status: payload.status,
            in_jobchart: payload.jobChart,
            in_jobtableno: payload.jobTableNo,
            in_jobchartnew: payload.jobChartNew,
            in_jobtablenonew: payload.jobTableNoNew,
            out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 5000 },
            out_trasferID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        }
    });

    if (!result.success) throw new Error(result.error);

    console.log("Procedure Result =>", JSON.stringify(result, null, 2));

    return {
        success: true,
        errorCode: result.outBinds.out_ErrorCode,
        errorMsg: result.outBinds.out_ErrorMsg,
        transferId: result.outBinds.out_trasferID
    };
}

module.exports = {
    getEmpTransferListRepo,
    getTransferTypesRepo,
    getEmpTransferDetailsRepo,
    saveEmpTransferRepo,
};
