const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { withTx } = require("../../../db/tx");


async function getLeaveListRepo(payload) {

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
}

async function getDepartmentListRepo() {

  const query = `
    SELECT
      num_deptmst_deptid AS id_value,
      var_deptmst_deptnamee AS display_text
    FROM aopr_deptmst_def
    ORDER BY var_deptmst_deptnamee
  `;

  const result = await executeQuery(
    query,
    {}
  );

  return result.rows;
}

async function getDesignationListRepo() {

  const query = `
    SELECT
      num_desigmst_designationid AS id_value,
      var_desigmst_designationname AS display_text
    FROM aopr_designationmst_def
    ORDER BY var_desigmst_designationname
  `;

  const result = await executeQuery(
    query,
    {}
  );

  return result.rows;
}

async function getEmployeeListRepo(payload) {

  const query = `
    SELECT
      num_employee_empid || ' - ' || var_employee_engname AS EmpName,
      TO_CHAR(num_employee_empid) AS num_employee_empid
    FROM aopr_employee_def
    WHERE num_employee_ulbid = :UlbId
    ORDER BY var_employee_engname
  `;

  const result = await executeQuery(
    query,
    {
      UlbId: payload.ulbId
    }
  );

  return result.rows;
}

async function getEmployeeDetailsRepo(payload) {

  const query = `
    SELECT
       num_employee_empid AS empId,
       num_employee_desigid AS desigid,
       num_employee_deptid AS deptid,
       num_employee_zone AS zones,
       num_employee_gradeid AS gradeid,
       num_employee_ulbid AS ulbid,
       num_employee_basic AS Salary,
       var_grademst_gradename AS Grade,
       ROUND(MONTHS_BETWEEN(SYSDATE, date_employee_joindate) / 12) AS years_of_service
    FROM aopr_employee_def
    INNER JOIN aopr_grademst_def
      ON num_grademst_gradeid = num_employee_gradeid
    WHERE num_employee_ulbid = :UlbId
      AND num_employee_empid = :EmployeeId
  `;

  const result = await executeQuery(
    query,
    {
      UlbId: payload.ulbId,
      EmployeeId: payload.employeeId
    }
  );

  return result.rows;
}

async function getPendingLeaveRepo(payload) {

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
      AND num_leave_empid = :EmployeeId
      AND var_leave_leavestatus = 'P'
  `;

  const result = await executeQuery(
    query,
    {
      UlbId: payload.ulbId,
      EmployeeId: payload.employeeId
    }
  );

  return result.rows;
}

async function getEmployeeLeaveSummaryRepo(payload) {

  const query = `
    SELECT *
    FROM aopr_empleave_mas a
    INNER JOIN aopr_empleave_det b
      ON a.num_empleave_id = b.num_empleave_id
    WHERE a.num_empleave_empid = :EmployeeId
      AND a.num_empleave_ulbid = :UlbId
  `;

  const result = await executeQuery(
    query,
    {
      EmployeeId: payload.employeeId,
      UlbId: payload.ulbId
    }
  );

  return result.rows;
}

async function getEmployeeLeaveBalanceRepo(payload) {

  const query = `
    SELECT
       num_empleavebal_empbalid,
       num_empleavebal_empid,
       var_empleavebal_leavetype_id,
       num_empleavebal_balance,
       num_empleavebal_allotted
    FROM AOPR_EMPLOYEE_EMPLEAVE_BAL
    WHERE num_empleavebal_empid = :EmployeeId
      AND var_empleavebal_leavetype_id = :LeaveTypeId
      AND :YourTargetUlbId NOT IN ('751', '1690', '4', '1670')
  `;

  const result = await executeQuery(
    query,
    {
      EmployeeId: payload.employeeId,
      LeaveTypeId: payload.leaveTypeId,
      YourTargetUlbId: payload.ulbId
    }
  );

  return result.rows;
}

async function saveEmployeeLeaveRepo(data) {

  try {

    const result = await withTx(async (conn) => {

      const res = await conn.execute(

        `BEGIN
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
         END;`,

        {

          in_UserId:
            data.userId,

          in_leaveid:
            Number(data.leaveId || 0),

          in_EmpId:
            Number(data.empId || 0),

          in_LEavetype:
            data.leaveType,

          in_balanceleave:
            Number(data.balanceLeave || 0),

          in_Ishalfdayleave:
            data.isHalfDayLeave || "N",

          in_fromdate:
            data.fromDate
              ? {
                  type: oracledb.DATE,
                  val: new Date(data.fromDate)
                }
              : null,

          in_todate:
            data.toDate
              ? {
                  type: oracledb.DATE,
                  val: new Date(data.toDate)
                }
              : null,

          in_leavereason:
            data.leaveReason,

          in_leavecontact:
            data.leaveContact,

          in_leavestaus:
            data.leaveStatus || "P",

          in_approveremark:
            data.approveRemark || "",

          in_ulbid:
            Number(data.ulbId || 0),

          in_mode:
            Number(data.mode || 1),

          out_ErrorCode: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
          },

          out_ErrorMsg: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 4000
          }

        }

      );

      console.log(
        "saveEmployeeLeaveRepo",
        res
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
  getLeaveListRepo,
  getDepartmentListRepo,
  getDesignationListRepo,
  getEmployeeListRepo,
  getEmployeeDetailsRepo,
  getPendingLeaveRepo,
  getEmployeeLeaveSummaryRepo,
  getEmployeeLeaveBalanceRepo,
  saveEmployeeLeaveRepo
};