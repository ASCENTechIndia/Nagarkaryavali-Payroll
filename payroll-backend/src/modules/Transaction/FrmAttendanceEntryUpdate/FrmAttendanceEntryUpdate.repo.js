const oracledb = require("oracledb");
const { executeProcedure } = require("../../../db/procedureExecutor");
const { executeQuery } = require("../../../db/queryExecutor");

async function getAttendanceEntryUpdateRepo(payload) {
    console.log("📤 Repo: Attendance Entry Update", payload);
    const { ulbid, salaryDate, attendDate, deptid, subdeptid, billNo, paysheettype, zone, empid, oldempno } = payload;

    const salaryBinds = { ulbid, salaryDate, deptid };

    const salaryConditions = [
        "date_salary_saldate = TO_DATE(:salaryDate,'DD-MM-YYYY')",
        "num_salary_ulbid = :ulbid",
        "num_salary_deptid = :deptid",
    ];

    if (subdeptid) {
        salaryConditions.push("num_employee_subdeptid = :subdeptid");
        salaryBinds.subdeptid = subdeptid;
    }
    if (billNo) {
        salaryConditions.push("var_deptslip_code = :billNo");
        salaryBinds.billNo = billNo;
    }

    const salarySql = `
        SELECT 1 CNT
        FROM aopr_salary_def
        INNER JOIN aopr_employee_def
            ON num_employee_ulbid = num_salary_ulbid
           AND num_employee_empid = num_salary_empid
        LEFT JOIN aopr_deptslip_mas
            ON num_deptslip_ulbid = num_employee_ulbid
           AND num_deptslip_empid = num_employee_empid
        WHERE ${salaryConditions.join("\nAND ")}
    `;

    const salaryResult = await executeQuery(salarySql, salaryBinds);

    if (!salaryResult.success) {
        throw new Error(salaryResult.error);
    }
    if (salaryResult.rows.length > 0) {
        return { salaryGenerated: true };
    }

    const attendanceBinds = { ulbid, attendDate, deptid, zone };

    const attendanceConditions = [
        "ED.num_employee_ulbid = :ulbid",
        "ED.num_employee_zone = :zone",
        "ED.num_employee_deptid = :deptid",
    ];

    if (paysheettype) {
        attendanceConditions.push("ED.num_employee_paysheettype = :paysheettype");
        attendanceBinds.paysheettype = paysheettype;
    }
    if (subdeptid) {
        attendanceConditions.push("ED.num_employee_subdeptid = :subdeptid");
        attendanceBinds.subdeptid = subdeptid;
    }


    if (Number(ulbid) === 930 || Number(ulbid) === 1750) {
        if (empid) {
            attendanceConditions.push("ED.num_employee_zone = :empid");
            attendanceBinds.empid = empid;
        }
        if (billNo) {
            attendanceConditions.push("var_deptslip_code = :billNo");
            attendanceBinds.billNo = billNo;
        }
    } else if (Number(ulbid) === 770) {
        if (oldempno) {
            attendanceConditions.push("ED.var_employee_oldempno = :oldempno");
            attendanceBinds.oldempno = oldempno;
        }
    } else {
        if (empid) {
            attendanceConditions.push("ED.num_employee_empid = :empid");
            attendanceBinds.empid = empid;
        }
    }

    const attendanceSql = `
        SELECT
            var_deptslip_sequence,
            ED.num_employee_empid,
            ED.var_employee_engname EmpName,
            ED.num_employee_deptid,
            ED.num_employee_zone,
            0 monthattend_workingdays,
            NVL(0,0) monthattend_medicalleave,
            NVL(num_attendentry_eldays,0) monthattend_earnedleave,
            NVL(num_attendentry_hpdays,0) monthattend_halfday,
            NVL(num_attendentry_lwpdays,0) monthattend_withoutpay,
            NVL(var_attendentry_mlremrk,NULL) monthattend_remark,
            am.num_attendentry_id attendentry_id,
            var_deptslip_code,
            ED.var_employee_oldempno        
        FROM aopr_employee_def ED
        INNER JOIN aoms_attendanceentry_mas am
            ON ED.num_employee_empid = num_attendentry_empid
           AND ED.num_employee_ulbid = num_attendentry_ulbid
           AND TRUNC(date_attendenrty_attendate) = TO_DATE(:attendDate,'DD-MM-YYYY')
        LEFT JOIN aopr_deptslip_mas
            ON ED.num_employee_empid = num_deptslip_empid
           AND ED.num_employee_ulbid = num_deptslip_ulbid
        WHERE ${attendanceConditions.join("\nAND ")}
        ORDER BY num_employee_empid
    `;

    const attendanceResult = await executeQuery(attendanceSql, attendanceBinds);
    if (!attendanceResult.success) {
        throw new Error(attendanceResult.error);
    }

    return {
        salaryGenerated: false,
        rows: attendanceResult.rows,
    };
}

async function saveBulkAttendanceRepo(payload) {
  console.log("📤 Repo : Save Bulk Attendance", payload);

  const {userId, id, category, zone, department, month, year, str, subdepartment} = payload;

  const result = await executeProcedure({
    sql: `
      BEGIN
        AOPR_BULKATTENDENCEUPD_INS(
          :in_userid,
          :in_id,
          :in_category,
          :in_zone,
          :in_department,
          :in_month,
          :in_year,
          :in_str,
          :in_subdepartment,
          :out_errorcode,
          :out_errormsg
        );
      END;
    `,
    binds: {
      in_userid: userId,
      in_id: id || 0,
      in_category: category,
      in_zone: zone,
      in_department: department,
      in_month: month,
      in_year: year,
      in_str: str,
      in_subdepartment: subdepartment,
      out_errorcode: {
        dir: oracledb.BIND_OUT,
        type: oracledb.NUMBER,
      },
      out_errormsg: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 4000,
      },
    },
  });

  console.log("Procedure Result =>", result);

  if (!result.success) {
    throw new Error(result.error);
  }
  return result.outBinds;
}

module.exports = {
    getAttendanceEntryUpdateRepo,
    saveBulkAttendanceRepo
};