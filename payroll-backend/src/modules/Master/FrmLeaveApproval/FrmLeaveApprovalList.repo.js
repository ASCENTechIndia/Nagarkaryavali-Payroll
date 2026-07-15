const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { withTx } = require("../../../db/tx");


async function getPendingLeaveListRepo(payload) {

  try {

    const query = `
      SELECT
           num_leave_id,
           num_leave_empid,
           var_employee_engname,
           var_leave_type,
           leave_name,
           num_leave_balanceleave,
           var_leave_ishalfdayleave,
           dptname,
           num_leave_ulbid,
           var_leave_leavestatus
      FROM view_leavedetails
      WHERE var_leave_leavestatus = 'P'
        AND num_leave_ulbid = :UlbId
    `;

    const result = await executeQuery(

      query,

      {
        UlbId: payload.ulbId
      }

    );

    return result.rows;

  } catch (err) {

    throw err;
  }
}


async function getLeaveTypeListRepo(payload) {

  try {

    const query = `
      SELECT
          leave_name,
          leaveid
      FROM vw_leaveconf
      WHERE ulbid = :UlbId
    `;

    const result = await executeQuery(

      query,

      {
        UlbId: payload.ulbId
      }

    );

    return result.rows;

  } catch (err) {

    throw err;
  }
}

async function getLeaveApprovalDetailsRepo(payload) {

  try {

    const query = `
      SELECT
           var_leave_ishalfdayleave,
           num_leave_id,
           num_leave_empid,
           var_employee_engname,
           var_leave_type,
           num_leave_balanceleave,
           TO_CHAR(date_leave_fromdate, 'DD-MM-YYYY') AS date_leave_fromdate,
           TO_CHAR(date_leave_todate, 'DD-MM-YYYY') AS date_leave_todate,
           num_employee_deptid,
           num_employee_desigid,
           var_leave_leavestatus,
           var_leave_leavereason,
           var_leave_leavecontact
      FROM view_leavedetails
      WHERE num_leave_ulbid = :UlbId
        AND num_leave_id = :LeaveId
        AND num_leave_empid = :EmpCode
    `;

    const result = await executeQuery(

      query,

      {
        UlbId: payload.ulbId,
        LeaveId: payload.leaveId,
        EmpCode: payload.empCode
      }

    );

    return result.rows;

  } catch (err) {

    throw err;
  }
}

async function saveLeaveApprovalRepo(payload) {
    try {
        const result = await withTx(async (conn) => {
            const res = await conn.execute(
                `
                BEGIN
                    aopr_leaveapplication_ins(
                        :in_UserId,
                        :in_leaveid,
                        :in_EmpId,
                        :in_LEavetype,
                        :in_balanceleave,
                        :in_Ishalfdayleave,
                        :in_fromdate,
                        :in_todate,
                        :in_leavereason,
                        :in_leavecontact,
                        :in_leavestaus,
                        :in_approveremark,
                        :in_ulbid,
                        :in_mode,
                        :out_ErrorCode,
                        :out_ErrorMsg
                    );
                END;
                `,
                {
                    in_UserId: {
                        dir: oracledb.BIND_IN,
                        type: oracledb.STRING,
                        val: payload.userId
                    },
                    in_leaveid: {
                        dir: oracledb.BIND_IN,
                        type: oracledb.NUMBER,
                        val: payload.leaveappid
                    },
                    in_EmpId: {
                        dir: oracledb.BIND_IN,
                        type: oracledb.NUMBER,
                        val: payload.empid
                    },
                    in_LEavetype: {
                        dir: oracledb.BIND_IN,
                        type: oracledb.NUMBER,
                        val: payload.leavetypeid
                    },
                    in_balanceleave: {
                        dir: oracledb.BIND_IN,
                        type: oracledb.NUMBER,
                        val: payload.balanceleave
                    },
                    in_Ishalfdayleave: {
                        dir: oracledb.BIND_IN,
                        type: oracledb.STRING,
                        val: payload.halfday
                    },
                    in_fromdate: {
                        dir: oracledb.BIND_IN,
                        type: oracledb.DATE,
                        val: payload.frmdate
                    },
                    in_todate: {
                        dir: oracledb.BIND_IN,
                        type: oracledb.DATE,
                        val: payload.todate
                    },
                    in_leavereason: {
                        dir: oracledb.BIND_IN,
                        type: oracledb.STRING,
                        val: payload.reason
                    },
                    in_leavecontact: {
                        dir: oracledb.BIND_IN,
                        type: oracledb.STRING,
                        val: payload.contact
                    },
                    in_leavestaus: {
                        dir: oracledb.BIND_IN,
                        type: oracledb.STRING,
                        val: payload.leavestatus
                    },
                    in_approveremark: {
                        dir: oracledb.BIND_IN,
                        type: oracledb.STRING,
                        val: payload.remark
                    },
                    in_ulbid: {
                        dir: oracledb.BIND_IN,
                        type: oracledb.NUMBER,
                        val: payload.ulbid
                    },
                    in_mode: {
                        dir: oracledb.BIND_IN,
                        type: oracledb.NUMBER,
                        val: payload.mode
                    },
                    out_ErrorCode: {
                        dir: oracledb.BIND_OUT,
                        type: oracledb.NUMBER
                    },
                    out_ErrorMsg: {
                        dir: oracledb.BIND_OUT,
                        type: oracledb.STRING,
                        maxSize: 5000000
                    }
                }
            );

            return res.outBinds;
        });

        return {
            success: true,
            errorCode: result.out_ErrorCode,
            errorMsg: result.out_ErrorMsg
        };
    } catch (err) {
        return {
            success: false,
            error: err.message
        };
    }
}

module.exports = {
  getPendingLeaveListRepo,
  getLeaveTypeListRepo,
  getLeaveApprovalDetailsRepo,
  saveLeaveApprovalRepo
};