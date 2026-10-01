const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { executeProcedure } = require("../../../db/procedureExecutor");

async function getAttendanceSummary({ ulbId }) {
  const sql = `
    SELECT
        num_attendentry_category,
        num_attendentry_zone,
        num_attendentry_department,
        num_attendentry_year,

        CASE
            WHEN num_attendentry_month = 1 THEN 'January'
            WHEN num_attendentry_month = 2 THEN 'February'
            WHEN num_attendentry_month = 3 THEN 'March'
            WHEN num_attendentry_month = 4 THEN 'April'
            WHEN num_attendentry_month = 5 THEN 'May'
            WHEN num_attendentry_month = 6 THEN 'June'
            WHEN num_attendentry_month = 7 THEN 'July'
            WHEN num_attendentry_month = 8 THEN 'August'
            WHEN num_attendentry_month = 9 THEN 'September'
            WHEN num_attendentry_month = 10 THEN 'October'
            WHEN num_attendentry_month = 11 THEN 'November'
            WHEN num_attendentry_month = 12 THEN 'December'
        END num_attendentry_month,

        var_category_name,
        var_zone_name,
        deptname,
        var_year,
        num_attendentry_month month,
        COUNT(num_attendentry_empid) empcount

    FROM aoms_attendanceentryauth_mas

    INNER JOIN aopr_category_mas
      ON num_attendentry_category = num_category_id

    INNER JOIN aopr_zone_mas
      ON num_attendentry_zone = num_zone_id

    INNER JOIN vw_deptconfig
      ON num_attendentry_department = deptid
     AND num_attendentry_ulbid = ulbid

    INNER JOIN aopr_year_mas
      ON num_attendentry_year = num_year_id

    WHERE var_attendentry_authflag IN ('P','R')
      AND num_attendentry_ulbid = :ulbId

    GROUP BY
        num_attendentry_category,
        num_attendentry_zone,
        num_attendentry_department,
        num_attendentry_year,
        num_attendentry_month,
        var_category_name,
        var_zone_name,
        deptname,
        var_year
  `;

  const binds = { ulbId };
  return await executeQuery(sql, binds);
}

async function getAttendanceDetail({
  categoryId,
  zoneId,
  departmentId,
  month,
  year,
  attendDate,
  ulbId,
}) {
  const sql = `
    SELECT *
    FROM aoms_attendanceentryauth_mas

    INNER JOIN aopr_employee_def
      ON num_employee_empid = num_attendentry_empid
     AND num_attendentry_ulbid = num_employee_ulbid

    LEFT JOIN aopr_deptslip_mas
      ON num_employee_empid = num_deptslip_empid
     AND num_employee_ulbid = num_deptslip_ulbid

    WHERE num_attendentry_category = :categoryId
      AND num_attendentry_zone = :zoneId
      AND num_attendentry_department = :departmentId
      AND num_attendentry_month = :month
      AND num_attendentry_year = :year

      AND num_attendentry_empid NOT IN
      (
          SELECT num_attendentry_empid
          FROM aoms_attendanceentry_mas
          WHERE date_attendenrty_attendate = TO_DATE(:attendDate,'DD/MM/YYYY')
          AND num_attendentry_ulbid = :ulbId
      )

      AND num_employee_ulbid = :ulbId
  `;

  const binds = {
    categoryId,
    zoneId,
    departmentId,
    month,
    year,
    attendDate,
    ulbId,
  };
  return await executeQuery(sql, binds);
}

async function executeAttendanceProcedure(params) {
  const sql = `
    BEGIN
      aopr_bulkattendenceexcell_ins(
        :in_userid,
        :in_id,
        :in_category,
        :in_zone,
        :in_department,
        :in_month,
        :in_year,
        :in_str,
        :in_str1,
        :in_str2,
        :in_str3,
        :in_str4,
        :in_str5,
        :in_str6,
        :in_str7,
        :in_str8,
        :in_str9,
        :in_mode,
        :out_errorcode,
        :out_errormsg
      );
    END;
  `;

  const binds = {
    in_userid: params.userId,
    in_id: params.id || 0,
    in_category: params.category,
    in_zone: params.zone,
    in_department: params.department,
    in_month: params.month,
    in_year: params.year,

    in_str: params.str || null,
    in_str1: params.str1 || null,
    in_str2: params.str2 || null,
    in_str3: params.str3 || null,
    in_str4: params.str4 || null,
    in_str5: params.str5 || null,
    in_str6: params.str6 || null,
    in_str7: params.str7 || null,
    in_str8: params.str8 || null,
    in_str9: params.str9 || null,

    in_mode: params.mode,

    out_errorcode: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER,
    },

    out_errormsg: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 2000,
    },
  };

  const result = await executeProcedure({
    sql,
    binds,
  });

  return result.outBinds;
}

module.exports = {
  getAttendanceSummary,
  getAttendanceDetail,
  executeAttendanceProcedure,
};
