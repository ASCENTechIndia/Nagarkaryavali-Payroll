const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { executeProcedure } = require("../../../db/procedureExecutor");

async function getAttendanceListRepo({
    categoryId,
    zoneId,
    deptId,
    subdeptId,
    billNo,
    empId,
    ulbid,
    month,
    year,
    lastDate,
    fromDate,
    toDate
}) {
    let sql = "";
    const binds = { ulbid };

    const formattedLastDate = lastDate ? lastDate.toUpperCase() : null;
    const formattedFromDate = fromDate ? fromDate.toUpperCase() : null;
    const formattedToDate = toDate ? toDate.toUpperCase() : null;
    
    if (ulbid == 4 || ulbid == 1670) {
        sql = `
            WITH leavebal AS (
                SELECT 
                    FROM_DATE + LEVEL - 1 AS ALLDATE,
                    1 AS DayCNT,
                    var_leave_type,
                    num_leave_empid,
                    var_leave_ishalfdayleave,
                    num_leave_ulbid
                FROM (
                    SELECT 
                        ROWNUM AS rn,
                        TO_DATE(date_leave_fromdate, 'DD-MON-YYYY') AS FROM_DATE,
                        TO_DATE(date_leave_todate, 'DD-MON-YYYY') AS TO_DATE,
                        var_leave_type,
                        num_leave_empid,
                        var_leave_ishalfdayleave,
                        num_leave_ulbid
                    FROM aopr_leavebalance_mst
                    WHERE num_leave_ulbid = :ulbid
                )
                CONNECT BY LEVEL <= TO_DATE - FROM_DATE + 1
                AND PRIOR rn = rn
                AND PRIOR dbms_random.value IS NOT NULL
            )
            SELECT 
                ED.num_employee_empid, 
                ED.var_employee_engname AS EmpName, 
                ED.num_employee_deptid,
                ED.num_employee_zone,
                0 AS monthattend_workingdays,
                SUM(CASE WHEN lb.var_leave_type IN (2,17) AND lb.var_leave_ishalfdayleave = 'N' THEN 1 ELSE 0 END) AS monthattend_earnedleave,
                SUM(CASE WHEN lb.var_leave_type = 1 AND lb.var_leave_ishalfdayleave = 'N' THEN 1 ELSE 0 END) AS monthattend_medicalleave,
                SUM(CASE WHEN lb.var_leave_ishalfdayleave = 'Y' THEN 1 ELSE 0 END) AS monthattend_halfday,
                0 AS monthattend_withoutpay,
                NVL(var_attendentry_mlremrk, NULL) AS monthattend_remark,
                am.num_attendentry_id AS attendentry_id,
                var_deptslip_sequence,
                var_deptslip_code,
                ED.var_employee_oldempno
            FROM aopr_employee_def ED
            LEFT JOIN aoms_attendanceentry_mas am 
                ON ED.num_employee_empid = num_attendentry_empid 
                AND ED.num_employee_ulbid = num_attendentry_ulbid  
                AND TRUNC(date_attendenrty_attendate) = TO_DATE(:lastDate, 'DD-MON-YYYY')
            LEFT JOIN leavebal lb 
                ON lb.num_leave_empid = ED.num_employee_empid 
                AND TRUNC(lb.alldate) BETWEEN TO_DATE(:fromDate, 'DD-MON-YYYY') AND TO_DATE(:toDate, 'DD-MON-YYYY') 
                AND lb.var_leave_ishalfdayleave = 'N'
            LEFT JOIN aopr_deptslip_mas dsm
                ON ED.num_employee_empid = dsm.num_deptslip_empid 
                AND ED.num_employee_ulbid = dsm.num_deptslip_ulbid
            WHERE 1 = 1  
                AND ED.num_employee_ulbid = :ulbid
        `;
        
        binds.lastDate = formattedLastDate;
        binds.fromDate = formattedFromDate;
        binds.toDate = formattedToDate;
    }
    else if (ulbid == 751 || ulbid == 870) {
        const dateSql = `
            SELECT 
                num_monthleavecal_fromdate AS fromdate,
                num_monthleavecal_todate AS todate 
            FROM aopr_monthleavecal_mas 
            WHERE TO_CHAR(TO_DATE(:lastDate, 'DD-MON-YYYY'), 'MM') = LPAD(num_monthleavecal_monthid, 2, 0) 
              AND num_monthleavecal_leapyearid = IS_LEAP_YEAR(SYSDATE)
        `;
        
        const dateResult = await executeQuery(dateSql, { lastDate: formattedLastDate });
        let calculatedFromDate = fromDate;
        let calculatedToDate = toDate;

        console.log("dateResult: ", dateResult)
        
        if (dateResult.success && dateResult.rows.length > 0) {
            const fromDateDigit = dateResult.rows[0].FROMDATE;
            const toDateDigit = dateResult.rows[0].TODATE;
            let monthNum = parseInt(month);
            let yearNum = parseInt(year);
            
            let fromMonth = monthNum === 1 ? 12 : monthNum - 1;
            let fromYear = monthNum === 1 ? yearNum - 1 : yearNum;
            
            const fromDateObj = new Date(fromYear, fromMonth - 1, parseInt(fromDateDigit));
            const toDateObj = new Date(yearNum, monthNum - 1, parseInt(toDateDigit));
            
            calculatedFromDate = fromDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-').toUpperCase();
            calculatedToDate = toDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-').toUpperCase();
        }
        
        sql = `
            WITH leavebal AS (
                SELECT 
                    FROM_DATE + LEVEL - 1 AS ALLDATE,
                    1 AS DayCNT,
                    var_leave_type,
                    num_leave_empid,
                    var_leave_ishalfdayleave,
                    num_leave_ulbid
                FROM (
                    SELECT 
                        ROWNUM AS rn,
                        TO_DATE(date_leave_fromdate, 'DD-MON-YYYY') AS FROM_DATE,
                        TO_DATE(date_leave_todate, 'DD-MON-YYYY') AS TO_DATE,
                        var_leave_type,
                        num_leave_empid,
                        var_leave_ishalfdayleave,
                        num_leave_ulbid
                    FROM aopr_leavebalance_mst
                    WHERE num_leave_ulbid = :ulbid
                )
                CONNECT BY LEVEL <= TO_DATE - FROM_DATE + 1
                AND PRIOR rn = rn
                AND PRIOR dbms_random.value IS NOT NULL
            )
            SELECT 
                ED.num_employee_empid, 
                ED.var_employee_engname AS EmpName, 
                ED.num_employee_deptid,
                ED.num_employee_zone,
                0 AS monthattend_workingdays,
                0 AS monthattend_medicalleave,
                SUM(NVL(m.DayCNT, 0)) AS monthattend_earnedleave,
                SUM(NVL(h.DayCNT, 0)) AS monthattend_halfday,
                SUM(NVL(c.DayCNT, 0)) AS monthattend_withoutpay,
                NVL(var_attendentry_mlremrk, NULL) AS monthattend_remark,
                am.num_attendentry_id AS attendentry_id,
                var_deptslip_sequence,
                var_deptslip_code,
                ED.var_employee_oldempno
            FROM aopr_employee_def ED
            LEFT JOIN aoms_attendanceentry_mas am 
                ON ED.num_employee_empid = num_attendentry_empid 
                AND ED.num_employee_ulbid = num_attendentry_ulbid  
                AND TRUNC(date_attendenrty_attendate) = TO_DATE(:lastDate, 'DD-MON-YYYY')
            LEFT JOIN leavebal m 
                ON m.num_leave_empid = ED.num_employee_empid 
                AND m.var_leave_type IN (3, 4, 5, 15) 
                AND TRUNC(m.ALLDATE) BETWEEN TO_DATE(:fromDate, 'DD-MON-YYYY') AND TO_DATE(:toDate, 'DD-MON-YYYY')
                AND TO_CHAR(TO_DATE(:lastDate, 'DD-MON-YYYY'), 'YYYY') = TO_CHAR(TO_DATE(m.ALLDATE), 'YYYY') 
                AND m.var_leave_ishalfdayleave = 'N'
            LEFT JOIN leavebal c 
                ON c.num_leave_empid = ED.num_employee_empid 
                AND c.var_leave_type IN (12, 13, 14) 
                AND TRUNC(c.ALLDATE) BETWEEN TO_DATE(:fromDate, 'DD-MON-YYYY') AND TO_DATE(:toDate, 'DD-MON-YYYY')
                AND TO_CHAR(TO_DATE(:lastDate, 'DD-MON-YYYY'), 'YYYY') = TO_CHAR(TO_DATE(c.ALLDATE), 'YYYY') 
                AND c.var_leave_ishalfdayleave = 'N'
            LEFT JOIN leavebal h 
                ON h.num_leave_empid = ED.num_employee_empid 
                AND h.var_leave_type IN (3, 4, 5, 15, 12, 13, 14) 
                AND TRUNC(h.ALLDATE) BETWEEN TO_DATE(:fromDate, 'DD-MON-YYYY') AND TO_DATE(:toDate, 'DD-MON-YYYY')
                AND TO_CHAR(TO_DATE(:lastDate, 'DD-MON-YYYY'), 'YYYY') = TO_CHAR(TO_DATE(h.ALLDATE), 'YYYY') 
                AND h.var_leave_ishalfdayleave = 'Y'
            LEFT JOIN aopr_deptslip_mas dsm
                ON ED.num_employee_empid = dsm.num_deptslip_empid 
                AND ED.num_employee_ulbid = dsm.num_deptslip_ulbid
            WHERE 1 = 1 
                AND ED.num_employee_ulbid = :ulbid
        `;
        
        binds.lastDate = formattedLastDate;
        binds.fromDate = calculatedFromDate;
        binds.toDate = calculatedToDate;
    }
    else {
        sql = `
            SELECT 
                ED.num_employee_empid, 
                ED.var_employee_engname AS EmpName,
                ED.num_employee_deptid,
                ED.num_employee_zone,
                0 AS monthattend_workingdays,
                NVL(m.leavebal, 0) AS monthattend_medicalleave,
                NVL(c.leavebal, 0) AS monthattend_earnedleave,
                NVL(h.leavebal, 0) AS monthattend_halfday,
                NVL(am.num_attendentry_lwpdays, 0) AS monthattend_withoutpay,
                NVL(var_attendentry_mlremrk, NULL) AS monthattend_remark,
                am.num_attendentry_id AS attendentry_id,
                var_deptslip_sequence,
                var_deptslip_code,
                ED.var_employee_oldempno
            FROM aopr_employee_def ED 
            LEFT JOIN aoms_attendanceentry_mas am 
                ON ED.num_employee_empid = am.num_attendentry_empid 
                AND ED.num_employee_ulbid = am.num_attendentry_ulbid  
                AND TRUNC(am.date_attendenrty_attendate) = TO_DATE(:lastDate, 'DD-MON-YYYY')
            LEFT JOIN vw_leavebal m 
                ON m.num_leave_empid = ED.num_employee_empid 
                AND m.var_leave_type = 1 
                AND TO_CHAR(TO_DATE(:lastDate, 'DD-MON-YYYY'), 'MM') = TO_CHAR(TO_DATE(m.date_leave_fromdate), 'MM')
                AND TO_CHAR(TO_DATE(:lastDate, 'DD-MON-YYYY'), 'YYYY') = TO_CHAR(TO_DATE(m.date_leave_fromdate), 'YYYY') 
                AND m.var_leave_ishalfdayleave = 'N' 
                AND m.num_leave_ulbid = ED.num_employee_ulbid
            LEFT JOIN vw_leavebal c 
                ON c.num_leave_empid = ED.num_employee_empid 
                AND c.var_leave_type = 2 
                AND TO_CHAR(TO_DATE(:lastDate, 'DD-MON-YYYY'), 'MM') = TO_CHAR(TO_DATE(c.date_leave_fromdate), 'MM')
                AND TO_CHAR(TO_DATE(:lastDate, 'DD-MON-YYYY'), 'YYYY') = TO_CHAR(TO_DATE(c.date_leave_fromdate), 'YYYY') 
                AND c.var_leave_ishalfdayleave = 'N' 
                AND c.num_leave_ulbid = ED.num_employee_ulbid
            LEFT JOIN vw_leavebal h 
                ON h.num_leave_empid = ED.num_employee_empid 
                AND h.var_leave_type = 2 
                AND TO_CHAR(TO_DATE(:lastDate, 'DD-MON-YYYY'), 'MM') = TO_CHAR(TO_DATE(h.date_leave_fromdate), 'MM')
                AND TO_CHAR(TO_DATE(:lastDate, 'DD-MON-YYYY'), 'YYYY') = TO_CHAR(TO_DATE(h.date_leave_fromdate), 'YYYY') 
                AND h.var_leave_ishalfdayleave = 'Y' 
                AND h.num_leave_ulbid = ED.num_employee_ulbid
            LEFT JOIN aopr_deptslip_mas dsm
                ON ED.num_employee_empid = dsm.num_deptslip_empid 
                AND ED.num_employee_ulbid = dsm.num_deptslip_ulbid
            WHERE 1 = 1  
                AND ED.num_employee_ulbid = :ulbid
                AND NVL(ED.var_employee_sevanivflag, 'N') <> 'Y'
        `;
        
        binds.lastDate = formattedLastDate;
    }
    
    if (categoryId && categoryId !== "0") {
        sql += " AND ED.num_employee_paysheettype = :categoryId";
        binds.categoryId = categoryId;
    }
    
    if (zoneId && zoneId !== "0") {
        sql += " AND ED.num_employee_zone = :zoneId";
        binds.zoneId = zoneId;
    }
    
    if (deptId && deptId !== "0") {
        sql += " AND ED.num_employee_deptid = :deptId";
        binds.deptId = deptId;
    }
    
    if (subdeptId && subdeptId !== "-1" && subdeptId !== "0") {
        sql += " AND ED.num_employee_subdeptid = :subdeptId";
        binds.subdeptId = subdeptId;
    }
    
    if (billNo && billNo !== "0" && billNo !== "-1" && billNo !== "") {
        sql += " AND var_deptslip_code = :billNo";
        binds.billNo = billNo;
    }
    
    if (empId && empId.trim() !== "") {
        if (ulbid == 770 || ulbid == 1750) {
            sql += " AND var_deptslip_sequence = :empId";
        } else if (ulbid == 1630) {
            sql += " AND ED.var_employee_oldempno = :empId";
        } else {
            sql += " AND ED.num_employee_empid = :empId";
        }
        binds.empId = empId;
    }
    
    sql += `
        GROUP BY 
            ED.num_employee_empid, 
            ED.var_employee_engname, 
            ED.num_employee_deptid, 
            ED.num_employee_zone,
            NVL(var_attendentry_mlremrk, NULL), 
            am.num_attendentry_id, 
            var_deptslip_sequence, 
            var_deptslip_code,
            ED.var_employee_oldempno
    `;
    
    if (ulbid == 1630) {
        sql += `
            ORDER BY 
                REGEXP_SUBSTR(VAR_EMPLOYEE_OLDEMPNO, '^[A-Za-z]+'),
                TO_NUMBER(REGEXP_SUBSTR(VAR_EMPLOYEE_OLDEMPNO, '[0-9]+')),
                NVL(TO_NUMBER(REGEXP_SUBSTR(VAR_EMPLOYEE_OLDEMPNO, '-([0-9]+)$', 1, 1, NULL, 1)), 0)
        `;
    } else {
        sql += " ORDER BY ED.num_employee_empid";
    }

    console.log("SQL: ", sql)
    console.log("Binds: ", binds)
    
    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const processedRows = result.rows.map(row => ({
        ...row,
        monthattend_workingdays: daysInMonth,
        monthattend_present: daysInMonth - (
            (parseFloat(row.monthattend_medicalleave) || 0) +
            (parseFloat(row.monthattend_earnedleave) || 0) +
            (parseFloat(row.monthattend_withoutpay) || 0) +
            ((parseFloat(row.monthattend_halfday) || 0) / 2)
        )
    }));
    
    return processedRows;
}

async function saveAttendanceRepo(payload) {
    const procedureName = payload.ulbId == 1750 ? "aopr_BulkAttendence_Ins_new" : "aopr_BulkAttendence_Ins";
    
    const result = await executeProcedure({
        sql: `
            BEGIN
                ${procedureName}(
                    :in_userid,
                    :in_id,
                    :in_category,
                    :in_zone,
                    :in_department,
                    :in_month,
                    :in_year,
                    :in_str,
                    :in_subdepartment,
                    :out_errorCode,
                    :out_ErrorMsg
                );
            END;
        `,
        binds: {
            in_userid: payload.userId,
            in_id: { val: 0, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_category: payload.categoryId,
            in_zone: payload.zoneId,
            in_department: payload.departmentId,
            in_month: payload.month,
            in_year: payload.year,
            in_str: payload.attendanceStr,
            in_subdepartment: payload.subdepartmentId || null,
            out_errorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 5000000 }
        }
    });
    
    if (!result.success) throw new Error(result.error);
    
    return {
        errorCode: result.outBinds.out_errorcode,
        errorMsg: result.outBinds.out_errormsg
    };
}

module.exports = {
    getAttendanceListRepo,
    saveAttendanceRepo,
};