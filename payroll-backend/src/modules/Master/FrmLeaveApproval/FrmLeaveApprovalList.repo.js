const { executeQuery } = require("../../../db/queryExecutor");


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

module.exports = {
  getPendingLeaveListRepo,
  getLeaveTypeListRepo,
  getLeaveApprovalDetailsRepo
};