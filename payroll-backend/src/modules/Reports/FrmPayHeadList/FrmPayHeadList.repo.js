const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");

async function getPFFundRepo({
    salaryDate,
    ulbid,
    categoryId,
    zoneId,
    empStatus,
    deptId
}) {
    let sql = `
        SELECT 
            SLIPNO,
            BILLNO,
            DATE_SALARY_SALDATE,
            ENGNAME,
            MARNAME,
            NUM_SALARY_BASIC,
            PF_SUBS,
            PF_REF,
            PF_SUBS_7TH,
            pf_subs + pf_ref + pf_subs_7th AS TOTAL
        FROM vw_pffundjcmc 
        WHERE DATE_SALARY_SALDATE = :salaryDate
          AND ULBID = :ulbid
          AND NUM_SALARY_CATEGORYID = :categoryId
          AND NUM_SALARY_ZONE = :zoneId
          AND VAR_EMPLOYEE_EMPSTATUS = :empStatus
    `;

    const binds = {
        salaryDate,
        ulbid,
        categoryId,
        zoneId,
        empStatus
    };

    if (deptId && deptId !== "-1" && deptId !== "0") {
        sql += ` AND NUM_SALARY_DEPTID = :deptId`;
        binds.deptId = deptId;
    }

    sql += `
        ORDER BY 
            CASE WHEN REGEXP_LIKE(SLIPNO, '^\\d+(\\.\\d+)?$') THEN 0 ELSE 1 END,
            CASE WHEN REGEXP_LIKE(SLIPNO, '^\\d+(\\.\\d+)?$') THEN TO_NUMBER(SLIPNO) ELSE NULL END,
            SLIPNO
    `;

    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getIncomeTaxRepo({
    salaryDate,
    ulbid,
    categoryId,
    zoneId,
    empStatus,
    deptId
}) {
    let sql = `
        SELECT 
            SLIPNO,
            BILLNO,
            DATE_SALARY_SALDATE,
            ENGNAME,
            MARNAME,
            PANNO,
            NUM_SALARY_BASIC,
            INCOMTAX,
            GROSSAMOUNT
        FROM vw_incometaxjcmc 
        WHERE DATE_SALARY_SALDATE = :salaryDate
          AND ULBID = :ulbid
          AND NUM_SALARY_CATEGORYID = :categoryId
          AND NUM_SALARY_ZONE = :zoneId
          AND VAR_EMPLOYEE_EMPSTATUS = :empStatus
    `;

    const binds = {
        salaryDate,
        ulbid,
        categoryId,
        zoneId,
        empStatus
    };

    if (deptId && deptId !== "-1" && deptId !== "0") {
        sql += ` AND NUM_SALARY_DEPTID = :deptId`;
        binds.deptId = deptId;
    }

    sql += `
        ORDER BY 
            CASE WHEN REGEXP_LIKE(SLIPNO, '^\\d+(\\.\\d+)?$') THEN 0 ELSE 1 END,
            CASE WHEN REGEXP_LIKE(SLIPNO, '^\\d+(\\.\\d+)?$') THEN TO_NUMBER(SLIPNO) ELSE NULL END,
            SLIPNO
    `;

    console.log("sql", sql)
    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getLICRepo({
    salaryDate,
    ulbid,
    categoryId,
    zoneId,
    empStatus,
    deptId
}) {
    let sql = "";

    if (ulbid == 770 || ulbid == 1750 || ulbid == 930) {
        sql = `
            SELECT 
                BILLNO,
                SLIPNO,
                EMPNAME,
                POLICYNUMBER,
                POLICYAMOUNT,
                SALDATE
            FROM VW_LICJCMC 
            WHERE ULBID = :ulbid
              AND PAYSHEETTYPE = :categoryId
              AND EMPLOYEE_ZONE = :zoneId
              AND NVL(POLICYAMOUNT, 0) > 0
              AND SALDATE = :salaryDate
              AND :salaryDate BETWEEN FROMDATE AND TODATE
        `;

        if (empStatus && empStatus !== "-1") {
            sql += ` AND EMPSTATUS = :empStatus`;
        }
    } 
    else {
        sql = `
            SELECT 
                empid AS SLIPNO,
                EMPID,
                EMPNAME,
                POLICYNUMBER,
                POLICYAMOUNT,
                SALDATE
            FROM VW_LICJCMC 
            WHERE ULBID = :ulbid
              AND PAYSHEETTYPE = :categoryId
              AND EMPLOYEE_ZONE = :zoneId
              AND NVL(POLICYAMOUNT, 0) > 0
              AND SALDATE = :salaryDate
              AND :salaryDate BETWEEN FROMDATE AND TODATE
        `;
    }

    const binds = {
        salaryDate,
        ulbid,
        categoryId,
        zoneId
    };

    if (empStatus && empStatus !== "-1" && (ulbid == 770 || ulbid == 1750 || ulbid == 930)) {
        binds.empStatus = empStatus;
    }

    if (deptId && deptId !== "-1" && deptId !== "0") {
        sql += ` AND DEPTID = :deptId`;
        binds.deptId = deptId;
    }

    sql += ` ORDER BY SLIPNO`;

    console.log("sql", sql)
    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

//  Get Professional Tax Slab details for ULB 770, 1750, 930
//  PayHead: 453
async function getProfessionalTaxSlabRepo({
    salaryDate,
    ulbid,
    categoryId,
    zoneId,
    empStatus,
    deptId
}) {

    console.log("body", {
        salaryDate,
        ulbid,
        categoryId,
        zoneId,
        empStatus,
        deptId
    })

    let sql = `
        SELECT 
            fixedamt,
            SUM(empmalecount) + SUM(empFemalecount) AS TOTAL_CNT,
            SUM(empFemalecount) AS FEMALE_CNT,
            SUM(empmalecount) AS MALE_CNT,
            SUM(empmaleamount) + SUM(empFemaleamout) AS TOTAL_AMT,
            SUM(empFemaleamout) AS FEMALE_AMT,
            SUM(empmaleamount) AS MALE_AMT
        FROM (
            SELECT 
                fixedamt,
                num_salarydtl_saldate,
                num_employee_zone,
                num_employee_deptid,
                num_employee_paysheettype,
                var_employee_empstatus,
                CASE WHEN num_salarydtl_amount = fixedamt AND var_employee_gender = 'M' THEN 1 ELSE 0 END AS empmalecount,
                CASE WHEN num_salarydtl_amount = fixedamt AND var_employee_gender = 'F' THEN 1 ELSE 0 END AS empFemalecount,
                CASE WHEN num_salarydtl_amount = fixedamt AND var_employee_gender = 'M' THEN num_salarydtl_amount ELSE 0 END AS empmaleamount,
                CASE WHEN num_salarydtl_amount = fixedamt AND var_employee_gender = 'F' THEN num_salarydtl_amount ELSE 0 END AS empFemaleamout,
                num_employee_ulbid AS ulbid
            FROM aopr_proftaxjcmcslab_mas
            INNER JOIN aopr_employee_def ON num_employee_ulbid = ulbid
            INNER JOIN aopr_salarydtl_def ON num_salarydtl_empid = num_employee_empid 
                AND num_salarydtl_ulbid = num_employee_ulbid
            WHERE num_salarydtl_payheadid = 453
        )
        WHERE 1=1
          AND num_salarydtl_saldate = :salaryDate
          AND ulbid = :ulbid
          AND num_employee_paysheettype = :categoryId
          AND num_employee_zone = :zoneId
          AND var_employee_empstatus = :empStatus
    `;

    const binds = {
        salaryDate,
        ulbid,
        categoryId,
        zoneId,
        empStatus
    };

    if (deptId && deptId !== "-1" && deptId !== "0") {
        sql += ` AND num_employee_deptid = :deptId`;
        binds.deptId = deptId;
    }

    sql += `
        GROUP BY fixedamt, num_salarydtl_saldate, num_employee_zone, num_employee_deptid, num_employee_paysheettype, var_employee_empstatus, ulbid
        ORDER BY FIXEDAMT
    `;

    console.log("sql", sql)
    const result = await executeQuery(sql, binds);

    console.log("result", result);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}


async function getMainPayHeadListRepo({
    salaryDate,
    ulbid,
    categoryId,
    zoneId,
    payHeadId,
    deptId,
    subDeptId,
    empStatus,
    useShortName
}) {

    console.log("body", {
        salaryDate,
        ulbid,
        categoryId,
        zoneId,
        payHeadId,
        deptId,
        subDeptId,
        empStatus,
        useShortName
    })

    let sql = `
        SELECT 
            LPAD(p.num_salary_empid, 5, '0') AS EMPID,
            p.var_employee_engname AS ENGNAME,
            p.var_employee_marname AS MARNAME,
            e.var_employee_pfno AS PFNO,        
            e.var_employee_panno AS PANNO,     
            p.oldempno AS OLDEMPNO,
            p.num_salarydtl_payheadid AS HEADID,
    `;

    if (useShortName || ulbid == 870) {
        sql += `
            h.var_payheads_shortname AS PAYHEAD_NAME,
            h.var_payheads_mname AS PAYHEAD_MNAME,
        `;
    } else {
        sql += `
            h.var_payheads_ename AS PAYHEAD_NAME,
            h.var_payheads_mname AS PAYHEAD_MNAME,
        `;
    }

    sql += `
            p.num_salarydtl_amount AS AMOUNT,
            p.NUM_SALARY_DEPTID AS DEPTID,
            p.VAR_DEPTMST_DEPTNAMEM AS DEPTNAME,
            p.ulbid AS ULBID,
            p.num_salary_categoryid AS CATEGORYID,
            p.num_salary_zone AS ZONEID,
            CASE 
                WHEN e.var_employee_gender = 'M' THEN 'Male'    
                WHEN e.var_employee_gender = 'F' THEN 'Female' 
                ELSE 'Not Defined' 
            END AS GENDER
    `;

    if (payHeadId == 287) {
        sql += `,
            NVL(TO_CHAR(r.num_rechead_currinst), '0') || '/' || 
            NVL(TO_CHAR(r.num_rechead_installments), '0') AS KAPATNO
        `;
    }

    sql += `
        FROM view_paysheet p
        INNER JOIN aopr_payheads_def h 
            ON p.num_salarydtl_payheadid = h.num_payheads_id 
            AND h.num_payheads_ulbid = p.ulbid
        INNER JOIN aopr_employee_def e
            ON e.num_employee_empid = p.num_salary_empid 
            AND e.num_employee_ulbid = p.ulbid
    `;

    if (payHeadId == 287) {
        sql += `
            LEFT JOIN aopr_rechead_mas r
                ON r.num_rechead_empid = e.num_employee_empid 
                AND r.num_rechead_ulbid = p.ulbid
        `;
    }

    sql += `
        WHERE 1=1
            AND p.date_salary_saldate = :salaryDate
            AND p.num_salarydtl_amount > 0
            AND p.num_salarydtl_payheadid = :payHeadId
            AND p.ulbid = :ulbid
            AND p.num_salary_categoryid = :categoryId
            AND p.num_salary_zone = :zoneId
    `;

    const binds = {
        salaryDate,
        payHeadId,
        ulbid,
        categoryId,
        zoneId
    };

    if (deptId && deptId !== "-1" && deptId !== "0") {
        sql += ` AND p.num_salary_deptid = :deptId`;
        binds.deptId = deptId;
    }

    if (subDeptId && subDeptId !== "-1" && subDeptId !== "0") {
        sql += ` AND e.num_employee_subdeptid = :subDeptId`;
        binds.subDeptId = subDeptId;
    }

    if (empStatus && empStatus !== "-1" && empStatus !== null && empStatus !== undefined) {
        sql += ` AND p.VAR_EMPLOYEE_EMPSTATUS = :empStatus`;
        binds.empStatus = empStatus;
    }

    sql += ` ORDER BY p.num_salary_empid`;

    console.log("getMainPayHeadListRepo: ", sql)
    const result = await executeQuery(sql, binds);

    console.log("result: ", result)
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

// Get AMC Professional Tax Query (ULB ID = 2, PayHead = 40)
async function getAMCProfessionalTaxRepo({
    salaryDate,
    ulbid,
    categoryId,
    zoneId,
    payHeadId,
    deptId,
    subDeptId
}) {
    const sql = `
        WITH slabs AS (
            SELECT 0 AS slab FROM dual UNION ALL
            SELECT 175 FROM dual UNION ALL
            SELECT 200 FROM dual UNION ALL
            SELECT 300 FROM dual UNION ALL
            SELECT 500 FROM dual UNION ALL
            SELECT 700 FROM dual
        )
        SELECT 
            s.slab,
            NVL(COUNT(v.empid), 0) AS emp_count,
            s.slab * NVL(COUNT(v.empid), 0) AS total_amount
        FROM slabs s
        LEFT JOIN view_amcpaysheet v
            ON v.amount = s.slab
            AND v.saldate = :salaryDate
            AND v.payheadid = :payHeadId
            AND v.ulbid = :ulbid
            AND v.categoryid = :categoryId
            AND v.zoneid = :zoneId
    `;

    const binds = {
        salaryDate,
        payHeadId,
        ulbid,
        categoryId,
        zoneId
    };

    if (deptId && deptId !== "-1" && deptId !== "0") {
        sql += ` AND v.deptid = :deptId`;
        binds.deptId = deptId;
    }

    if (subDeptId && subDeptId !== "-1" && subDeptId !== "0") {
        sql += ` AND v.subdeptid = :subDeptId`;
        binds.subDeptId = subDeptId;
    }

    sql += `
        LEFT JOIN aopr_employeeLIC_def l
            ON l.num_employeelic_orgid = v.ulbid
            AND l.num_employeelic_empid = v.empid
        GROUP BY s.slab
        ORDER BY s.slab
    `;

    console.log("sql", sql)
    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

// Get AMC 10% & 14% Query (ULB ID = 2, PayHead = 99999)

async function getAMCTenFourteenRepo({
    salaryDate,
    ulbid,
    categoryId,
    zoneId,
    deptId,
    subDeptId
}) {
    const sql = `
        WITH grp AS (
            SELECT 
                deptid, 
                subdeptid,
                DENSE_RANK() OVER (ORDER BY deptid, subdeptid) AS grp_no
            FROM view_amcpaysheet
            WHERE saldate = :salaryDate
              AND payheadid IN (381, 382)
              AND ulbid = :ulbid
              AND categoryid = :categoryId
              AND zoneid = :zoneId
    `;

    const binds = {
        salaryDate,
        ulbid,
        categoryId,
        zoneId
    };

    if (deptId && deptId !== "-1" && deptId !== "0") {
        sql += ` AND deptid = :deptId`;
        binds.deptId = deptId;
    }

    if (subDeptId && subDeptId !== "-1" && subDeptId !== "0") {
        sql += ` AND subdeptid = :subDeptId`;
        binds.subDeptId = subDeptId;
    }

    sql += `
            GROUP BY deptid, subdeptid
        ),
        tagged AS (
            SELECT 
                b.*,
                g.grp_no,
                CASE WHEN MOD(g.grp_no, 2) = 1 THEN 'L' ELSE 'R' END AS side,
                CASE WHEN b.payheadid = 381 THEN b.amount ELSE 0 END AS PERC_10,
                CASE WHEN b.payheadid = 382 THEN b.amount ELSE 0 END AS PERC_14
            FROM view_amcpaysheet b
            INNER JOIN grp g ON g.deptid = b.deptid AND g.subdeptid = b.subdeptid
            WHERE b.saldate = :salaryDate
              AND b.payheadid IN (381, 382)
              AND b.ulbid = :ulbid
              AND b.categoryid = :categoryId
              AND b.zoneid = :zoneId
    `;

    if (deptId && deptId !== "-1" && deptId !== "0") {
        sql += ` AND b.deptid = :deptId`;
    }

    if (subDeptId && subDeptId !== "-1" && subDeptId !== "0") {
        sql += ` AND b.subdeptid = :subDeptId`;
    }

    sql += `
        )
        SELECT 
            empid,
            empname,
            deptid,
            subdeptid,
            dept,
            subdept,
            side,
            MAX(perc_10) AS perc_10,
            MAX(perc_14) AS perc_14,
            grp_no
        FROM tagged
        GROUP BY empid, empname, deptid, dept, subdeptid, subdept, side, grp_no
        ORDER BY deptid, subdeptid, empid
    `;

    console.log("sql", sql)
    const result = await executeQuery(sql, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getExcelGrossTDSRepo({
    salaryDate,
    ulbid,
    categoryId,
    zoneId,
    payHeadId,
    empStatus,
    deptId,
    hsgRentType,
    bankRecType,
    festAdvType
}) {
    // Build CTE Gross Query
    let grossSql = `
        SELECT 
            billcode,
            empsequence,
            EmpPfNo,
            panno,
            num_salary_empid AS empid,
            var_employee_engname AS empname,
            NVL(num_salarydtl_amount, 0) AS amount_e
        FROM view_paysheet
        WHERE ulbid = :ulbid
          AND var_paysubheads_type = 'E'
          AND num_salarydtl_amount > 0
          AND date_salary_saldate = :salaryDate
          AND num_salary_categoryid = :categoryId
          AND NUM_SALARY_ZONE = :zoneId
    `;

    const binds = {
        ulbid,
        salaryDate,
        categoryId,
        zoneId
    };

    if (deptId && deptId !== "-1" && deptId !== "0") {
        grossSql += ` AND num_salary_deptid = :deptId`;
        binds.deptId = deptId;
    }

    if (empStatus && empStatus !== "-1" && (ulbid == 770 || ulbid == 1750 || ulbid == 930)) {
        grossSql += ` AND var_employee_empstatus = :empStatus`;
        binds.empStatus = empStatus;
    }

    grossSql += ` ORDER BY empsequence, orderno`;

    // Build CTE TDS Query
    let tdsSql = `
        SELECT 
            num_salary_empid AS empid,
            var_employee_engname AS empname,
            NVL(num_salarydtl_amount, 0) AS amount_t
    `;

    if ((ulbid == 770 || ulbid == 1750 || ulbid == 930) && payHeadId == "439") {
        tdsSql = `
            SELECT 
                num_salary_empid AS empid,
                var_employee_engname AS empname,
                CASE WHEN HSGRENT = 1 THEN '124 Room'
                     WHEN HSGRENT = 2 THEN 'बंगला भाडे'
                     WHEN HSGRENT = 3 THEN 'गेंदालाल मिल'
                     WHEN HSGRENT = 4 THEN 'नर्स क्वार्टर'
                     WHEN HSGRENT = 5 THEN 'गुरुनानक नगर'
                     WHEN HSGRENT = 6 THEN 'MIDC' END AS hsgrenttype,
                NVL(num_salarydtl_amount, 0) AS amount_t
        `;
    }

    if ((ulbid == 770 || ulbid == 1750 || ulbid == 930) && payHeadId == "453") {
        tdsSql = `
            SELECT 
                num_salary_empid AS empid,
                var_employee_engname AS empname,
                CASE WHEN UPPER(gender) = 'M' THEN 'Male'
                     WHEN UPPER(gender) = 'F' THEN 'Female'
                     ELSE 'Other'
                END AS gender,
                NVL(num_salarydtl_amount, 0) AS amount_t
        `;
    }

    tdsSql += `
        FROM view_paysheet
        WHERE ulbid = :ulbid
          AND num_salarydtl_amount > 0
          AND date_salary_saldate = :salaryDate
          AND num_salary_categoryid = :categoryId
          AND NUM_SALARY_ZONE = :zoneId
    `;

    if (payHeadId && payHeadId !== "-1" && payHeadId !== "0") {
        tdsSql += ` AND num_payheads_id = :payHeadId`;
        binds.payHeadId = payHeadId;
    }

    if (deptId && deptId !== "-1" && deptId !== "0") {
        tdsSql += ` AND num_salary_deptid = :deptId`;
    }

    if (empStatus && empStatus !== "-1" && (ulbid == 770 || ulbid == 1750 || ulbid == 930)) {
        tdsSql += ` AND var_employee_empstatus = :empStatus`;
    }

    if ((ulbid == 770 || ulbid == 1750 || ulbid == 930) && payHeadId == "439") {
        if (hsgRentType && hsgRentType !== "-1") {
            tdsSql += ` AND hsgrent = :hsgRentType`;
            binds.hsgRentType = hsgRentType;
        }
    }

    if ((ulbid == 770 || ulbid == 1750 || ulbid == 930) && payHeadId == "440") {
        if (bankRecType && bankRecType !== "-1") {
            tdsSql += ` AND var_empbank_bankid = :bankRecType`;
            binds.bankRecType = bankRecType;
        }
        tdsSql += ` INNER JOIN aopr_empbank_det ON num_empbank_ulbid = ulbid 
                     AND num_empbank_empid = num_salary_empid 
                     AND var_empbank_bankid = :bankRecType`;
    }

    if ((ulbid == 770 || ulbid == 1750 || ulbid == 930) && payHeadId == "443") {
        if (festAdvType && festAdvType !== "-1") {
            tdsSql += ` AND festid = :festAdvType`;
            binds.festAdvType = festAdvType;
        }
    }

    tdsSql += ` ORDER BY num_salary_empid, orderno`;

    // Execute both queries
    const [grossResult, tdsResult] = await Promise.all([
        executeQuery(grossSql, binds),
        executeQuery(tdsSql, binds)
    ]);

    if (!grossResult.success) throw new Error(grossResult.error);
    if (!tdsResult.success) throw new Error(tdsResult.error);

    // Merge results
    const grossMap = new Map();
    grossResult.rows.forEach(row => {
        if (!grossMap.has(row.EMPID)) {
            grossMap.set(row.EMPID, {
                billno: row.BILLCODE,
                slipno: row.EMPSEQUENCE,
                empname: row.EMPNAME,
                empPfNo: row.EMPPFNO,
                panno: row.PANNO,
                gross: 0
            });
        }
        grossMap.get(row.EMPID).gross += row.AMOUNT_E;
    });

    const tdsMap = new Map();
    tdsResult.rows.forEach(row => {
        tdsMap.set(row.EMPID, {
            amount_t: row.AMOUNT_T,
            hsgrenttype: row.HSGRENTTYPE,
            gender: row.GENDER
        });
    });

    // Combine results
    const combinedResults = [];
    for (const [empid, grossData] of grossMap) {
        const tdsData = tdsMap.get(empid);
        if (tdsData) {
            combinedResults.push({
                ...grossData,
                amount_t: tdsData.amount_t,
                hsgrenttype: tdsData.hsgrenttype,
                gender: tdsData.gender
            });
        }
    }

    // Sort by slipno
    combinedResults.sort((a, b) => {
        const aNum = parseInt(a.slipno);
        const bNum = parseInt(b.slipno);
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
        if (!isNaN(aNum)) return -1;
        if (!isNaN(bNum)) return 1;
        return (a.slipno || "").localeCompare(b.slipno || "");
    });

    return combinedResults;
}

// Get Sub-Detail for Professional Tax (ULB 751, 870 - PayHead 358)

async function getSubDetailProfessionalTaxRepo({
    salaryDate,
    ulbid,
    categoryId,
    zoneId,
    deptId
}) {
    let sql = `
        SELECT SUM(MALE) AS MALE, SUM(FEMALE) AS FEMALE, SUM(MALE) + SUM(FEMALE) AS TOTAL, Amount
        FROM (
            SELECT 
                CASE WHEN var_employee_gender = 'M' THEN 1 ELSE 0 END AS MALE,
                CASE WHEN var_employee_gender = 'F' THEN 1 ELSE 0 END AS FEMALE,
                p.num_salarydtl_amount AS Amount,
                p.ulbid
            FROM view_paysheet p
            INNER JOIN aopr_payheads_def h 
                ON p.num_salarydtl_payheadid = h.num_payheads_id 
                AND num_payheads_ulbid = p.ulbid
            INNER JOIN aopr_employee_def e
                ON e.num_employee_empid = p.num_salary_empid 
                AND e.num_employee_ulbid = p.ulbid
            WHERE p.date_salary_saldate = :salaryDate
              AND p.num_salarydtl_amount > 0
              AND p.num_salarydtl_payheadid = '358'
              AND p.ulbid = :ulbid
              AND p.num_salary_categoryid = :categoryId
              AND p.num_salary_zone = :zoneId
    `;

    const binds = {
        salaryDate,
        ulbid,
        categoryId,
        zoneId
    };

    if (deptId && deptId !== "-1" && deptId !== "0") {
        sql += ` AND p.num_salary_deptid = :deptId`;
        binds.deptId = deptId;
    }

    const sqlFirstPart = sql + `
              AND e.VAR_EMPLOYEE_ENGNAME LIKE '%-%'
            ORDER BY p.num_salary_empid
        )
        GROUP BY ulbid, Amount
    `;
    
    const sqlSecondPart = sql + `
              AND e.VAR_EMPLOYEE_ENGNAME NOT LIKE '%-%'
            ORDER BY p.num_salary_empid
        )
        GROUP BY ulbid, Amount
    `;

    const [firstResult, secondResult] = await Promise.all([
        executeQuery(sqlFirstPart, binds),
        executeQuery(sqlSecondPart, binds)
    ]);

    if (!firstResult.success) throw new Error(firstResult.error);
    if (!secondResult.success) throw new Error(secondResult.error);

    console.log("sql", sql)

    return {
        withHyphen: firstResult.rows,
        withoutHyphen: secondResult.rows
    };
}

module.exports = {
    getPFFundRepo,
    getIncomeTaxRepo,
    getLICRepo,
    getProfessionalTaxSlabRepo,
    getMainPayHeadListRepo,
    getAMCProfessionalTaxRepo,
    getAMCTenFourteenRepo,
    getExcelGrossTDSRepo,
    getSubDetailProfessionalTaxRepo
};