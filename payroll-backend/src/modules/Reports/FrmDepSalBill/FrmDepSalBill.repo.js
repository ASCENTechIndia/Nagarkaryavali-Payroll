const { executeQuery } = require("../../../db/queryExecutor");

/**
 * Fetches and processes department salary bill records matching legacy C# business logic.
 * Handles dynamic matrix column assignments and cross-table employee synchronization.
 * @param {Object} payload Filters received from the controller
 * @returns {Object} Structured data maps for the report engine
 */
async function AllEarningDeductions(payload) {
  try {
    const { salaryDate, ulbId, zoneId, deptId, categoryId, gradeId, subDeptId, billNo } = payload;

    // 1. Initialized core bind properties
    const bindParams = {
      salaryDate: salaryDate,
      ulbId: String(ulbId).trim(),
      zoneId: String(zoneId).trim(),
    };

    // --- QUERY 1: FETCH TRANSACTION SPLITS ---
    let query1 = `
      SELECT 
        LPAD(num_salary_empid, 5, '0') AS num_salary_empid, 
        var_employee_engname,
        var_employee_marname,
        num_salary_presentdays AS num_salary_calcdays,
        var_desigmst_designationname,
        var_deptmst_deptnamee,
        var_grademst_gradename,
        0 AS New_PayHeadID,
        var_payheads_mname AS var_payheads_mname, 
        var_payheads_Ename AS var_payheads_Ename,
        VAR_PAYSUBHEADS_TYPE AS earntype,
        SUM(NVL(num_salarydtl_amount, 0)) AS num_salarydtl_amount,
        NVL(num_salary_totalearning, 0) AS num_salary_totalearn, 
        NVL(num_salary_totaldeduct, 0) AS num_salary_totaldeduct,
        num_payheads_id,
        OrderNo,
        0 AS GPFNOPRANNO,
        JOINDATE, 
        RETIREMNTDATE
    `;

    if (ulbId === "770" || ulbId === "1750") {
      query1 += ` , num_deptsalorder_orderno, subdept, var_deptmst_deptnamee AS dept_name `;
    }
    if (ulbId === "2" || ulbId === "1630") {
      query1 += ` , subdept `;
    }

    query1 += ` FROM view_paysheet `;

    if (ulbId === "770" || ulbId === "1750") {
      query1 += ` 
        LEFT JOIN aopr_deptsalorder_det 
          ON num_deptsalorder_deptid = num_salary_deptid 
          AND num_deptsalorder_desigid = num_salary_desigid 
          AND num_deptsalorder_subdeptid = subdept 
      `;
    }

    query1 += ` WHERE date_salary_saldate = TO_DATE(:salaryDate, 'DD-Month-YYYY') AND ulbid = :ulbId AND NUM_SALARY_ZONE = :zoneId `;

    // --- QUERY 2: FETCH BASELINE EMPLOYEE HEAD MASTERS ---
    let query2 = `
      SELECT 
        e.num_employee_empid, 
        p.VAR_EMPLOYEE_ENGNAME, 
        p.VAR_EMPLOYEE_MARNAME,
        0 AS New_PayHeadID, 
        p.num_salary_presentdays AS presentdays, 
        ROUND(EarnBasic) AS EarnBasic, 
        ROUND(LeaveBasic) AS LeaveBasic,
        num_employee_gradepay AS GradePay,
        var_employee_panno AS PfNo,
        var_employee_pfno AS GPFNOPRANNO,
        JOINDATE, 
        RETIREMNTDATE,
        var_payscalemst_payscalename AS payscalename,
        TO_NUMBER(EMPsequence) AS EMPsequence,
        BILLCODE,
        VAR_DEPTSUB_SDEPTNAMEM AS subdept,
        p.var_deptmst_deptnamee AS dept_name,
        var_employee_oldempno AS oldempno,
        num_salary_basic AS totbasic
    `;

    if (ulbId === "770" || ulbId === "1750") {
      query2 += ` , num_deptsalorder_orderno AS desigorder `;
    }

    query2 += `
      FROM aopr_employee_def e 
      INNER JOIN view_paysheet p 
        ON num_salary_empid = num_employee_empid 
        AND date_salary_saldate = TO_DATE(:salaryDate, 'DD-Month-YYYY') 
        AND num_employee_ulbid = ulbid
    `;

    if (ulbId === "1630") {
      query2 += ` LEFT JOIN aopr_payscalemst_def c ON c.num_payscalemst_payscaleid = e.num_employee_payscaleid `;
    } else {
      query2 += ` INNER JOIN aopr_payscalemst_def c ON c.num_payscalemst_payscaleid = e.num_employee_payscaleid `;
    }

    query2 += ` 
      LEFT JOIN aopr_subdept_mas 
        ON num_deptsub_ulbid = num_employee_ulbid 
        AND num_deptsub_deptid = num_employee_deptid 
        AND num_employee_subdeptid = num_deptsub_id 
    `;

    if (ulbId === "770" || ulbId === "1750") {
      query2 += ` 
        LEFT JOIN aopr_deptsalorder_det 
          ON num_deptsalorder_deptid = num_employee_deptid 
          AND num_deptsalorder_desigid = num_employee_desigid 
          AND num_deptsalorder_subdeptid = num_employee_subdeptid 
      `;
    }

    query2 += ` WHERE num_employee_zone = :zoneId AND e.num_employee_ulbid = :ulbId `;

    // 2. CRITICAL FIX: Push dynamic keys globally directly into the real binder object
    if (deptId && deptId !== "-1") {
      const sqlClause = ` AND num_salary_deptid = :deptId `;
      query1 += sqlClause;
      query2 += ` AND num_employee_deptid = :deptId `;
      bindParams.deptId = String(deptId).trim();
    }

    if (categoryId && categoryId !== "0") {
      query1 += ` AND num_salary_categoryid = :categoryId `;
      query2 += ` AND num_employee_paysheettype = :categoryId `;
      bindParams.categoryId = String(categoryId).trim();
    }

    if (gradeId && gradeId !== "0") {
      query1 += ` AND num_salary_gradeid = :gradeId `;
      query2 += ` AND num_employee_gradeid = :gradeId `; // Add structural grade tracking parameter if mapped inside master definitions
      bindParams.gradeId = String(gradeId).trim();
    }

    if (subDeptId && subDeptId !== "" && subDeptId !== "-1" && subDeptId !== "0") {
      if (ulbId === "590") {
        const structuralSubdeptQuery = ` 
          AND num_salary_empid IN (
            SELECT num_employeedep_empid FROM AOPR_EMPLOYEEDEP_CONF 
            WHERE num_employeedep_subdepid = :subDeptId 
              AND num_employeedep_depid = :deptId 
              AND num_employeedep_ulbid = :ulbId
          ) 
        `;
        query1 += structuralSubdeptQuery;
        query2 += structuralSubdeptQuery.replace("num_salary_empid", "e.num_employee_empid");
      } else if (ulbId === "770" || ulbId === "1750" || ulbId === "2" || ulbId === "1630") {
        query1 += ` AND subdept = :subDeptId `;
        query2 += ` AND num_employee_subdeptid = :subDeptId `;
      }
      bindParams.subDeptId = String(subDeptId).trim();
    }

    if (billNo && billNo !== "0" && billNo !== "-1" && billNo !== "") {
      if (ulbId === "770" || ulbId === "1750") {
        query1 += ` AND BILLCODE = :billNo `;
        query2 += ` AND BILLCODE = :billNo `;
      }
      bindParams.billNo = String(billNo).trim();
    }

    // --- Dynamic Sorting Append Layer ---
    query1 += `
      GROUP BY 
        num_salary_empid, var_employee_engname, var_employee_marname, num_salary_presentdays, 
        var_desigmst_designationname, var_deptmst_deptnamee, var_grademst_gradename, 
        var_payheads_mname, var_payheads_Ename, VAR_PAYSUBHEADS_TYPE, 
        NVL(num_salary_totalearning, 0), NVL(num_salary_totaldeduct, 0), num_payheads_id, OrderNo, JOINDATE, RETIREMNTDATE
    `;

    if (ulbId === "770" || ulbId === "1750") {
      query1 += ` , num_deptsalorder_orderno, subdept, var_deptmst_deptnamee ORDER BY OrderNo, num_deptsalorder_orderno, OrderNo `;
    } else if (ulbId === "2" || ulbId === "1630") {
      query1 += ` , subdept ORDER BY OrderNo `;
    } else {
      query1 += ` ORDER BY OrderNo `;
    }

    query2 += ` ORDER BY num_employee_empid `;

    console.log("EXECUTING PARALLEL QUERIES WITH CORRECT UNIFIED BINDINGS:");
    console.log("BINDINGS OBJECT:", bindParams);
    console.log("query2:", query2);

    // --- EXECUTE QUERIES PARALLEL ---
    const [resultTx, resultEmp] = await Promise.all([executeQuery(query1, bindParams), executeQuery(query2, bindParams)]);

    const deptSalBillRows = resultTx.rows;
    const tblEmployeeRows = resultEmp.rows;

    console.log("deptSalBillRows", resultTx.rowCount);
    console.log("tblEmployeeRows", resultEmp.rowCount);

    if (!deptSalBillRows || deptSalBillRows.length === 0) {
      return { success: false, message: "|| Record not Found||", employees: [] };
    }

    if (!tblEmployeeRows || tblEmployeeRows.length === 0) {
      return { success: false, message: "Employee Records Not Found", employees: [] };
    }

    // --- QUERY 3: PAYHEAD HEADERS EXTRACTION ---
    const queryPayhead = `
      SELECT 
        num_payheads_id,
        UTL_RAW.CAST_TO_VARCHAR2(HEXTORAW(REPLACE(RAWTOHEX(var_payheads_shortname),'2808DE',''))) AS payheadname,
        num_payheads_orderno 
      FROM aopr_payheads_def 
      INNER JOIN aopr_paysubheads_def ON num_paysubheads_id = num_payhead_subheadid 
      WHERE num_payheads_ulbid = :ulbId 
        AND var_paysubheads_type IN ('D','E') 
      GROUP BY num_payheads_id, var_payheads_shortname, num_payheads_orderno 
      ORDER BY num_payheads_orderno
    `;

    const payHeadResult = await executeQuery(queryPayhead, { ulbId });

    // Instantiates 1-70 layout configuration mappings
    const headers = {};
    for (let i = 1; i <= 70; i++) {
      headers[`header${i}`] = "";
    }

    const payheadOrderMap = {};

    payHeadResult.rows.forEach((h) => {
      const orderNoStr = String(h.NUM_PAYHEADS_ORDERNO || h.num_payheads_orderno || "").trim();
      const name = h.PAYHEADNAME || h.payheadname || "";

      if (orderNoStr) {
        payheadOrderMap[orderNoStr] = name;

        if (orderNoStr === "1") headers.header1 = name;
        if (orderNoStr === "2") headers.header2 = name;
        if (orderNoStr === "3") headers.header3 = name;
        if (orderNoStr === "4") headers.header4 = name;
        if (orderNoStr === "5") headers.header5 = name;
        if (orderNoStr === "6") headers.header6 = name;
        if (orderNoStr === "7") headers.header7 = name;
        if (orderNoStr === "8") headers.header8 = name;
        if (orderNoStr === "9") headers.header9 = name;
        if (orderNoStr === "10") headers.header10 = name;
        if (orderNoStr === "11") headers.header11 = name;
        if (orderNoStr === "12") headers.header12 = name;
        if (orderNoStr === "13") headers.header13 = name;
        if (orderNoStr === "14") headers.header14 = name;
        if (orderNoStr === "15") headers.header15 = name;
        if (orderNoStr === "16") headers.header16 = name;
        if (orderNoStr === "17") headers.header17 = name;
        if (orderNoStr === "18") headers.header18 = name;
        if (orderNoStr === "19") headers.header19 = name;
        if (orderNoStr === "20") headers.header20 = name;
        if (orderNoStr === "21") headers.header21 = name;
        if (orderNoStr === "22") headers.header22 = name;
        if (orderNoStr === "23") headers.header23 = name;
        if (orderNoStr === "24") headers.header24 = name;
        if (orderNoStr === "25") headers.header25 = name;
        if (orderNoStr === "26") headers.header26 = name;
        if (orderNoStr === "27") headers.header27 = name;
        if (orderNoStr === "28") headers.header28 = name;
        if (orderNoStr === "29") headers.header29 = name;
        if (orderNoStr === "30") headers.header30 = name;
        if (orderNoStr === "31") headers.header31 = name;
        if (orderNoStr === "32") headers.header32 = name;

        if (orderNoStr === "101") headers.header33 = name;
        if (orderNoStr === "102") headers.header34 = name;
        if (orderNoStr === "103") headers.header35 = name;
        if (orderNoStr === "104") headers.header36 = name;
        if (orderNoStr === "105") headers.header37 = name;
        if (orderNoStr === "106") headers.header38 = name;
        if (orderNoStr === "107") headers.header39 = name;
        if (orderNoStr === "108") headers.header40 = name;
        if (orderNoStr === "109") headers.header41 = name;
        if (orderNoStr === "110") headers.header42 = name;
        if (orderNoStr === "111") headers.header43 = name;
        if (orderNoStr === "112") headers.header44 = name;
        if (orderNoStr === "113") headers.header45 = name;
        if (orderNoStr === "114") headers.header46 = name;
        if (orderNoStr === "115") headers.header47 = name;
        if (orderNoStr === "116") headers.header48 = name;
        if (orderNoStr === "117") headers.header49 = name;
        if (orderNoStr === "118") headers.header50 = name;
        if (orderNoStr === "119") headers.header51 = name;
        if (orderNoStr === "120") headers.header52 = name;
        if (orderNoStr === "121") headers.header53 = name;
        if (orderNoStr === "122") headers.header54 = name;
        if (orderNoStr === "123") headers.header55 = name;
        if (orderNoStr === "124") headers.header56 = name;
        if (orderNoStr === "125") headers.header57 = name;
        if (orderNoStr === "126") headers.header58 = name;
        if (orderNoStr === "127") headers.header59 = name;
        if (orderNoStr === "128") headers.header60 = name;
        if (orderNoStr === "129") headers.header61 = name;
        if (orderNoStr === "130") headers.header62 = name;
        if (orderNoStr === "131") headers.header63 = name;
        if (orderNoStr === "132") headers.header64 = name;
        if (orderNoStr === "133") headers.header65 = name;
        if (orderNoStr === "134") headers.header66 = name;
        if (orderNoStr === "135") headers.header67 = name;
        if (orderNoStr === "136") headers.header68 = name;
        if (orderNoStr === "137") headers.header69 = name;
        if (orderNoStr === "138") headers.header70 = name;
      }
    });

    // --- IN-MEMORY MATRIX PROCESSING LAYER ---
    const masterEmployeeMap = {};
    const grandTotals = {};

    // Map 1-70 layout structure properties cleanly to match the layout context
    for (let i = 1; i <= 32; i++) grandTotals[`rTotal${i}`] = 0;
    for (let i = 101; i <= 138; i++) grandTotals[`rTotal${i}`] = 0;

    let globalEarn = 0;
    let globalDeduct = 0;

    tblEmployeeRows.forEach((emp) => {
      const rawEmpId = emp.NUM_EMPLOYEE_EMPID || emp.num_employee_empid;
      const paddedId = String(rawEmpId).padStart(5, "0");

      const baseRecord = {
        num_employee_empid: paddedId,
        VAR_EMPLOYEE_ENGNAME: emp.VAR_EMPLOYEE_ENGNAME || emp.var_employee_engname,
        VAR_EMPLOYEE_MARNAME: emp.VAR_EMPLOYEE_MARNAME || emp.var_employee_marname,
        New_PayHeadID: 0,
        presentdays: Number(emp.PRESENTDAYS || emp.presentdays) || 0,
        EarnBasic: Number(emp.EARNBASIC || emp.earnbasic) || 0,
        LeaveBasic: Number(emp.LEAVEBASIC || emp.leavebasic) || 0,
        GradePay: Number(emp.GRADEPAY || emp.gradepay) || 0,
        PfNo: emp.PFNO || emp.pfno || "",
        GPFNOPRANNO: emp.GPFNOPRANNO || emp.gpfnopranno || "",
        JOINDATE: emp.JOINDATE || emp.joindate,
        RETIREMNTDATE: emp.RETIREMNTDATE || emp.retiremntdate,
        payscalename: emp.PAYSCALENAME || emp.payscalename || "",
        EMPsequence: Number(emp.EMPSEQUENCE || emp.empsequence) || 0,
        BILLCODE: emp.BILLCODE || emp.billcode || "",
        subdept: emp.SUBDEPT || emp.subdept || "",
        dept_name: emp.DEPT_NAME || emp.dept_name || "",
        oldempno: emp.OLDEMPNO || emp.oldempno || "",
        totbasic: Number(emp.TOTBASIC || emp.totbasic) || 0,
        Total: 0,
        DTotal: 0,
        TotalPayamount: 0,
        Designation: "",
        PayScale: emp.PAYSCALENAME || emp.payscalename || "",
      };

      if (ulbId === "770" || ulbId === "1750") {
        baseRecord.desigorder = emp.DESIGORDER || emp.desigorder;
      }

      // Changed: Initialized keys in lowercase ('colX') to align with Handlebars templates
      for (let i = 1; i <= 32; i++) baseRecord[`col${i}`] = 0;
      for (let i = 101; i <= 138; i++) baseRecord[`col${i}`] = 0;

      masterEmployeeMap[paddedId] = baseRecord;
    });

    deptSalBillRows.forEach((tx) => {
      const orderNoStr = String(tx.ORDERNO || tx.orderno || "").trim();
      const hasPayheadHeader = payheadOrderMap[orderNoStr] !== undefined;

      if (hasPayheadHeader) {
        const txEmpId = String(tx.NUM_SALARY_EMPID || tx.num_salary_empid).padStart(5, "0");
        const targetEmp = masterEmployeeMap[txEmpId];

        if (targetEmp) {
          const amount = Number(tx.NUM_SALARYDTL_AMOUNT || tx.num_salarydtl_amount) || 0;
          const totalEarn = Number(tx.NUM_SALARY_TOTALEARN || tx.num_salary_totalearn) || 0;
          const totalDeduct = Number(tx.NUM_SALARY_TOTALDEDUCT || tx.num_salary_totaldeduct) || 0;

          // Changed: Written to lower-cased 'col' to prevent blank views inside loop rows
          targetEmp[`col${orderNoStr}`] = amount;

          targetEmp.DTotal = totalDeduct;
          targetEmp.Total = totalEarn;
          targetEmp.TotalPayamount = totalEarn - totalDeduct;
          targetEmp.Designation = tx.VAR_DESIGMST_DESIGNATIONNAME || tx.var_desigmst_designationname || "";

          // Changed: Aggregates directly onto the structural rTotal layout properties expected by PDF Engine
          grandTotals[`rTotal${orderNoStr}`] = (grandTotals[`rTotal${orderNoStr}`] || 0) + amount;
        }
      }
    });

    Object.values(masterEmployeeMap).forEach((emp) => {
      globalEarn += emp.Total;
      globalDeduct += emp.DTotal;
    });

    const sortedEmployeesArray = Object.values(masterEmployeeMap).sort((a, b) => {
      return String(a.num_employee_empid).localeCompare(String(b.num_employee_empid));
    });

    return {
      success: true,
      headers,
      employees: sortedEmployeesArray,
      reportTotals: grandTotals, // Changed: Provided reportTotals context object matching PDF dynamic lookups
      grandTotals, // Retained fallback
      grandEarn: globalEarn,
      grandDeduct: globalDeduct,
      grandNet: globalEarn - globalDeduct,
      rowCount: sortedEmployeesArray.length,
    };
  } catch (err) {
    console.error("Critical Exception in FrmDepSalBill repository mapping routine:", err);
    throw err;
  }
}

async function getDesignationStatus(payload) {
  const query = `
      SELECT 
        DESIGID, DESIGNATION, ORDERNO,
        SUM(WORKING) AS WORKING, SUM(RIKT) AS RIKT, SUM(WORKING)+SUM(RIKT) AS POST
      FROM
      (
        SELECT 
          CASE WHEN num_akritibandhd_status='WO' THEN 1 ELSE 0 END AS WORKING,
          CASE WHEN num_akritibandhd_status='RI' THEN 1 ELSE 0 END AS RIKT,
          num_desigmst_designationid AS DESIGID,
          var_desigmst_designationname AS DESIGNATION,
          num_deptsalorder_orderno AS ORDERNO
        FROM aopr_akritibandh_det
        INNER JOIN aopr_employee_def ON num_employee_ulbid = num_akritibandhd_ulbid AND num_employee_empid = num_akritibandhd_empid
        LEFT JOIN aopr_designationmst_def ON num_desigmst_designationid = num_employee_desigid
        LEFT JOIN aopr_deptsalorder_det ON num_deptsalorder_deptid = num_employee_deptid AND num_deptsalorder_desigid = num_employee_desigid
        WHERE num_akritibandhd_ulbid = :ulbId
      )
      GROUP BY DESIGID, DESIGNATION, ORDERNO ORDER BY ORDERNO
  `;

  return await executeQuery(query, { ulbId: payload.ulbId });
}

async function getEarningDeductionTotalData(payload) {
  try {
    const { salaryDate, ulbId, zoneId, deptId, categoryId, gradeId, subDeptId, reportType } = payload;

    function convertToOracleDateFormat(dateStr) {
      if (!dateStr) return null;
      
      if (/^\d{2}-[A-Z]{3}-\d{4}$/.test(dateStr)) {
        return dateStr;
      }
      
      const monthMap = {
        'January': 'JAN', 'February': 'FEB', 'March': 'MAR', 'April': 'APR',
        'May': 'MAY', 'June': 'JUN', 'July': 'JUL', 'August': 'AUG',
        'September': 'SEP', 'October': 'OCT', 'November': 'NOV', 'December': 'DEC'
      };
      
      const parts = dateStr.split(/[- ]/);
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = monthMap[parts[1]] || parts[1].toUpperCase().substring(0, 3);
        const year = parts[2];
        return `${day}-${month}-${year}`;
      }
      
      return dateStr;
    }

    const oracleDate = convertToOracleDateFormat(salaryDate);
    console.log("Converted Date:", oracleDate);

    const bindParams = {
      salaryDate: oracleDate,
      ulbId: String(ulbId).trim(),
      zoneId: String(zoneId).trim(),
    };

    const payheadType = reportType === "EARN" ? "'E'" : reportType === "DEDUCT" ? "'D'" : "'E'";
    console.log("Payhead Type Filter:", payheadType);

    let query1 = `
      SELECT 
        LPAD(num_salary_empid, 5, '0') AS num_salary_empid, 
        var_employee_engname,
        var_employee_marname,
        num_salary_presentdays AS num_salary_calcdays,
        var_desigmst_designationname,
        var_deptmst_deptnamee,
        var_grademst_gradename,
        0 AS New_PayHeadID,
        var_payheads_mname, 
        var_payheads_Ename,
        VAR_PAYSUBHEADS_TYPE AS earntype,
        SUM(NVL(num_salarydtl_amount, 0)) AS num_salarydtl_amount,
        NVL(num_salary_totalearning, 0) AS num_salary_totalearn, 
        NVL(num_salary_totaldeduct, 0) AS num_salary_totaldeduct,
        num_payheads_id,
        OrderNo,
        0 AS GPFNOPRANNO,
        JOINDATE, 
        RETIREMNTDATE
    `;

    if (ulbId === "870") {
      query1 += ` , NUM_SALARYORDER_DEPTORDER, NUM_SALARYORDER_DESIGORDER `;
    }

    query1 += ` FROM view_paysheet `;

    if (ulbId === "870") {
      query1 += ` 
        LEFT JOIN aopr_salaryorder_det 
          ON NUM_SALARYORDER_ULBID = ulbid 
          AND NUM_SALARYORDER_DEPTID = num_salary_deptid 
          AND NUM_SALARYORDER_DESIGID = num_salary_desigid 
      `;
    }

    query1 += ` WHERE date_salary_saldate = TO_DATE(:salaryDate, 'DD-MON-YYYY') AND ulbid = :ulbId AND NUM_SALARY_ZONE = :zoneId `;

    if (deptId && deptId !== "-1") {
      query1 += ` AND num_salary_deptid = :deptId `;
      bindParams.deptId = String(deptId).trim();
    }

    if (categoryId && categoryId !== "0") {
      query1 += ` AND num_salary_categoryid = :categoryId `;
      bindParams.categoryId = String(categoryId).trim();
    }

    if (gradeId && gradeId !== "0") {
      query1 += ` AND num_salary_gradeid = :gradeId `;
      bindParams.gradeId = String(gradeId).trim();
    }

    if (subDeptId && subDeptId !== "" && subDeptId !== "-1" && subDeptId !== "0") {
      if (ulbId === "590") {
        query1 += ` 
          AND num_salary_empid IN (
            SELECT num_employeedep_empid FROM AOPR_EMPLOYEEDEP_CONF 
            WHERE num_employeedep_subdepid = :subDeptId 
              AND num_employeedep_depid = :deptId 
              AND num_employeedep_ulbid = :ulbId
          ) 
        `;
        bindParams.subDeptId = String(subDeptId).trim();
      }
    }

    query1 += ` AND VAR_PAYSUBHEADS_TYPE = ${payheadType} `;

    query1 += `
      GROUP BY 
        num_salary_empid, var_employee_engname, var_employee_marname, 
        num_salary_presentdays, var_desigmst_designationname, 
        var_deptmst_deptnamee, var_grademst_gradename, 
        var_payheads_mname, var_payheads_Ename, VAR_PAYSUBHEADS_TYPE, 
        NVL(num_salary_totalearning, 0), NVL(num_salary_totaldeduct, 0), 
        num_payheads_id, OrderNo, JOINDATE, RETIREMNTDATE
    `;

    if (ulbId === "870") {
      query1 += ` , NUM_SALARYORDER_DEPTORDER, NUM_SALARYORDER_DESIGORDER `;
    }

    if (ulbId === "870") {
      query1 += ` ORDER BY OrderNo, NUM_SALARYORDER_DEPTORDER, NUM_SALARYORDER_DESIGORDER `;
    } else {
      query1 += ` ORDER BY OrderNo `;
    }

    console.log("Query1:", query1);
    console.log("Bind Params:", JSON.stringify(bindParams, null, 2));

    let query2 = `
      SELECT 
        e.num_employee_empid,
        e.var_employee_engname,
        e.var_employee_marname,
        0 AS new_payheadid,
    `;

    if (ulbId === "870") {
      query2 += `
        (nvl(p.num_salary_presentdays,0) - (nvl(NUM_ATTENDENTRY_ELDAYS,0) + nvl(NUM_ATTENDENTRY_MLDAYS,0) + (nvl(NUM_ATTENDENTRY_HPDAYS,0)/2))) AS presentdays,
      `;
    } else {
      query2 += `
        (nvl(p.num_salary_presentdays,0) - (nvl(NUM_ATTENDENTRY_ELDAYS,0) + nvl(NUM_ATTENDENTRY_MLDAYS,0) + (nvl(NUM_ATTENDENTRY_HPDAYS,0)/2) + nvl(NUM_ATTENDENTRY_LWPDAYS,0))) AS presentdays,
      `;
    }

    query2 += `
        num_salary_calcbasic AS LeaveBasic,
        num_employee_basic AS EarnBasic,
        num_employee_gradepay AS gradepay,
        var_employee_panno AS pfno,
        var_employee_pfno AS gpfnopranno,
        DATE_EMPLOYEE_JOINDATE AS JOINDATE,
        DATE_EMPLOYEE_RETIREMNTDATE AS RETIREMNTDATE,
        NUM_ATTENDENTRY_ELDAYS AS EL,
        NUM_ATTENDENTRY_MLDAYS AS ML,
        0 AS CL,
        NUM_ATTENDENTRY_HPDAYS AS HPL,
        NUM_ATTENDENTRY_LWPDAYS AS LWP,
        var_employee_oldempno AS oldempno
    `;

    if (ulbId === "870") {
      query2 += ` , num_salaryorder_deptorder, num_salaryorder_desigorder `;
    }

    query2 += `
      FROM aopr_employee_def e
      INNER JOIN aopr_salary_def p 
        ON num_salary_ulbid = e.num_employee_ulbid 
        AND num_salary_empid = e.num_employee_empid 
        AND date_salary_saldate = TO_DATE(:salaryDate, 'DD-MON-YYYY')
      INNER JOIN aoms_attendanceentry_mas 
        ON num_attendentry_ulbid = num_salary_ulbid 
        AND num_employee_empid = num_attendentry_empid 
        AND DATE_ATTENDENRTY_ATTENDATE = date_salary_saldate
    `;

    if (ulbId === "870") {
      query2 += `
        LEFT JOIN aopr_salaryorder_det 
          ON num_salaryorder_ulbid = num_employee_ulbid 
          AND num_salaryorder_deptid = num_employee_deptid 
          AND num_salaryorder_desigid = num_employee_desigid
      `;
    }

    query2 += `
      WHERE e.num_employee_zone = :zoneId 
        AND e.num_employee_ulbid = :ulbId
    `;

    if (deptId && deptId !== "-1") {
      query2 += ` AND e.num_employee_deptid = :deptId `;
    }

    if (categoryId && categoryId !== "0") {
      query2 += ` AND e.num_employee_paysheettype = :categoryId `;
    }

    if (gradeId && gradeId !== "0") {
      query2 += ` AND e.num_employee_gradeid = :gradeId `;
    }

    if (subDeptId && subDeptId !== "" && subDeptId !== "-1" && subDeptId !== "0") {
      if (ulbId === "590") {
        query2 += ` 
          AND e.num_employee_empid IN (
            SELECT num_employeedep_empid FROM AOPR_EMPLOYEEDEP_CONF 
            WHERE num_employeedep_subdepid = :subDeptId 
              AND num_employeedep_depid = :deptId 
              AND num_employeedep_ulbid = :ulbId
          ) 
        `;
      }
    }

    query2 += ` ORDER BY e.num_employee_empid `;

    console.log("Query2:", query2);

    const [resultTx, resultEmp] = await Promise.all([
      executeQuery(query1, bindParams),
      executeQuery(query2, bindParams)
    ]);

    console.log("Transaction Rows:", resultTx?.rowCount || 0);
    console.log("Employee Rows:", resultEmp?.rowCount || 0);

    if (!resultTx.rows || resultTx.rows.length === 0) {
      console.log("No transaction data found");
      return { success: false, message: "|| Record not Found||", employees: [] };
    }
    if (!resultEmp.rows || resultEmp.rows.length === 0) {
      console.log("No employee data found");
      return { success: false, message: "Employee Records Not Found", employees: [] };
    }

    const queryPayhead = `
      SELECT 
        num_payheads_id,
        UTL_RAW.CAST_TO_VARCHAR2(HEXTORAW(REPLACE(RAWTOHEX(var_payheads_shortname),'2808DE',''))) AS payheadname,
        num_payheads_orderno 
      FROM aopr_payheads_def 
      INNER JOIN aopr_paysubheads_def 
        ON num_paysubheads_id = num_payhead_subheadid 
      WHERE num_payheads_ulbid = :ulbId 
        AND var_paysubheads_type = ${payheadType}
      GROUP BY num_payheads_id, var_payheads_shortname, num_payheads_orderno 
      ORDER BY num_payheads_orderno
    `;

    const payHeadResult = await executeQuery(queryPayhead, { ulbId: String(ulbId).trim() });
    console.log("Payhead Rows:", payHeadResult?.rowCount || 0);

    const headers = {};
    for (let i = 1; i <= 70; i++) headers[`header${i}`] = "";

    const payheadOrderMap = {};
    if (payHeadResult.rows) {
      payHeadResult.rows.forEach((row) => {
        const orderNoStr = String(row.NUM_PAYHEADS_ORDERNO || row.num_payheads_orderno || "").trim();
        const name = row.PAYHEADNAME || row.payheadname || "";
        if (orderNoStr) {
          payheadOrderMap[orderNoStr] = name;
          const oNum = parseInt(orderNoStr, 10);
          if (oNum >= 1 && oNum <= 32) headers[`header${oNum}`] = name;
          if (oNum >= 101 && oNum <= 138) headers[`header${oNum - 68}`] = name;
        }
      });
    }

    const masterEmployeeMap = {};
    const grandTotals = {};
    for (let i = 1; i <= 32; i++) grandTotals[`rTotal${i}`] = 0;
    for (let i = 101; i <= 138; i++) grandTotals[`rTotal${i}`] = 0;

    let totalEarnAccumulator = 0;
    let totalDeductAccumulator = 0;

    resultEmp.rows.forEach((emp) => {
      const rawEmpId = emp.NUM_EMPLOYEE_EMPID || emp.num_employee_empid;
      const paddedId = String(rawEmpId).padStart(5, "0");

      const baseRecord = {
        num_employee_empid: paddedId,
        VAR_EMPLOYEE_ENGNAME: emp.VAR_EMPLOYEE_ENGNAME || emp.var_employee_engname || "",
        VAR_EMPLOYEE_MARNAME: emp.VAR_EMPLOYEE_MARNAME || emp.var_employee_marname || "",
        presentdays: Number(emp.PRESENTDAYS || emp.presentdays) || 0,
        LeaveBasic: Number(emp.LEAVEBASIC || emp.leavebasic) || 0,
        EarnBasic: Number(emp.EARNBASIC || emp.earnbasic) || 0,
        GradePay: Number(emp.GRADEPAY || emp.gradepay) || 0,
        PfNo: emp.PFNO || emp.pfno || "",
        GPFNOPRANNO: emp.GPFNOPRANNO || emp.gpfnopranno || "",
        JOINDATE: emp.JOINDATE || emp.joindate,
        RETIREMNTDATE: emp.RETIREMNTDATE || emp.retiremntdate,
        EL: Number(emp.EL || emp.el) || 0,
        ML: Number(emp.ML || emp.ml) || 0,
        CL: Number(emp.CL || emp.cl) || 0,
        HPL: Number(emp.HPL || emp.hpl) || 0,
        LWP: Number(emp.LWP || emp.lwp) || 0,
        oldempno: emp.OLDEMPNO || emp.oldempno || "",
        Total: 0,
        DTotal: 0,
        TotalPayamount: 0,
        Designation: "",
        PayScale: "",
      };

      if (ulbId === "870") {
        baseRecord.NUM_SALARYORDER_DEPTORDER = emp.NUM_SALARYORDER_DEPTORDER || emp.num_salaryorder_deptorder;
        baseRecord.NUM_SALARYORDER_DESIGORDER = emp.NUM_SALARYORDER_DESIGORDER || emp.num_salaryorder_desigorder;
      }

      for (let i = 1; i <= 32; i++) baseRecord[`col${i}`] = 0;
      for (let i = 101; i <= 138; i++) baseRecord[`col${i}`] = 0;

      masterEmployeeMap[paddedId] = baseRecord;
    });

    resultTx.rows.forEach((tx) => {
      const orderNoStr = String(tx.ORDERNO || tx.orderno || "").trim();
      if (payheadOrderMap[orderNoStr] !== undefined) {
        const txEmpId = String(tx.NUM_SALARY_EMPID || tx.num_salary_empid).padStart(5, "0");
        const targetEmp = masterEmployeeMap[txEmpId];

        if (targetEmp) {
          const amt = Number(tx.NUM_SALARYDTL_AMOUNT || tx.num_salarydtl_amount) || 0;
          targetEmp[`col${orderNoStr}`] = amt;
          targetEmp.DTotal = Number(tx.NUM_SALARY_TOTALDEDUCT || tx.num_salary_totaldeduct) || 0;
          targetEmp.Total = Number(tx.NUM_SALARY_TOTALEARN || tx.num_salary_totalearn) || 0;
          targetEmp.TotalPayamount = targetEmp.Total - targetEmp.DTotal;
          targetEmp.Designation = tx.VAR_DESIGMST_DESIGNATIONNAME || tx.var_desigmst_designationname || "";

          grandTotals[`rTotal${orderNoStr}`] = (grandTotals[`rTotal${orderNoStr}`] || 0) + amt;
        }
      }
    });

    Object.values(masterEmployeeMap).forEach((emp) => {
      totalEarnAccumulator += emp.Total;
      totalDeductAccumulator += emp.DTotal;
    });

    let finalSortedArray = Object.values(masterEmployeeMap);
    if (ulbId === "870") {
      finalSortedArray.sort((a, b) => {
        const deptOrderDiff = (Number(a.NUM_SALARYORDER_DEPTORDER) || 0) - (Number(b.NUM_SALARYORDER_DEPTORDER) || 0);
        if (deptOrderDiff !== 0) return deptOrderDiff;
        return (Number(a.NUM_SALARYORDER_DESIGORDER) || 0) - (Number(b.NUM_SALARYORDER_DESIGORDER) || 0);
      });
    } else {
      finalSortedArray.sort((a, b) => String(a.num_employee_empid).localeCompare(String(b.num_employee_empid)));
    }

    const isEarnChecked = reportType === "EARN";
    let dynamicTitleReportHeader = "";
    if (ulbId === "870") {
      dynamicTitleReportHeader = isEarnChecked ? "वेतन पत्रक - मिळकत तपशील" : "वेतन पत्रक - कटाई";
    }

    console.log("Final Employee Count:", finalSortedArray.length);
    console.log("Grand Total Earn:", totalEarnAccumulator);
    console.log("Grand Total Deduct:", totalDeductAccumulator);

    return {
      success: true,
      headers,
      reportHeaderTitle: dynamicTitleReportHeader,
      employees: finalSortedArray,
      reportTotals: grandTotals,
      grandEarn: totalEarnAccumulator,
      grandDeduct: totalDeductAccumulator,
      grandNet: totalEarnAccumulator - totalDeductAccumulator,
      rowCount: finalSortedArray.length,
    };

  } catch (err) {
    console.error("Exception in getEarningDeductionTotalData:", err);
    throw err;
  }
}

module.exports = {
  AllEarningDeductions,
  getDesignationStatus,
  getEarningDeductionTotalData
};
