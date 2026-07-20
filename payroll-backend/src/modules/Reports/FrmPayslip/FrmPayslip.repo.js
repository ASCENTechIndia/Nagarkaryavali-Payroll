const { executeQuery } = require("../../../db/queryExecutor");

// ===============================
// Get Employee Details
// ===============================
const getEmployeeDetails = async ({ ulbId, empId }) => {
  let query = `
        select var_employee_marname, num_employee_empid
        from aopr_employee_def
        left join aopr_deptslip_mas
            on num_employee_empid = num_deptslip_empid
           and num_employee_ulbid = num_deptslip_ulbid
    `;

  if (Number(ulbId) === 770 || Number(ulbId) === 1750) {
    query += `
        where var_deptslip_sequence = :empId
    `;
  } else if (Number(ulbId) === 1630) {
    query += `
        where var_employee_oldempno = :empId
    `;
  } else {
    query += `
        where num_employee_empid = :empId
    `;
  }

  query += `
        and num_employee_ulbid = :ulbId
    `;

  return await executeQuery(query, {
    empId,
    ulbId,
  });
};

// ===============================
// Get Pay Slip
// ===============================
// const getPaySlip = async ({ ulbId, empId, deptId, subDept, categoryId, zoneId, month, year }) => {
//   const lastDate = new Date(year, month, 0);

//   const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//   const lstdate = `${String(lastDate.getDate()).padStart(2, "0")}-${monthNames[lastDate.getMonth()]}-${lastDate.getFullYear()}`;

//   const binds = {
//     ulbId,
//     empId,
//     lstdate,
//   };

//   //==========================================================
//   // Salary Detail
//   //==========================================================

//   let display = `
//  SELECT	num_salary_empid EmpId,
//         var_employee_engname EmpEName,
//         var_employee_marname EmpMName,
//         date_salary_saldate SalDate,
//         var_desigmst_designationname Designation,
//         var_deptmst_deptnamee Dept,
//         var_grademst_gradename Grade,
//         num_salary_presentdays,
//         total_days,
//         zonename,
//         empbankno,
//         emppanno,
//         emppfno,
//         num_salary_basic,
//         num_salary_gradepay,
//         panno,
//         billcode,
//         empsequence,
//         withoutpay,
//         medicalleave,
//         earnedleave,
//         halfday,
//         oldempno
// FROM view_paysheet
// WHERE ulbid=:ulbId
// `;

//   display += `
// and num_salarydtl_payheadid not IN (367,676,677,218)
// `;

//   display += `
// and num_salary_empid=:empId
// and date_salary_saldate=:lstdate
// `;

//   if (deptId != 0) {
//     display += `
// and num_salary_deptid=:deptId
// `;
//     binds.deptId = deptId;
//   }

//   if (subDept && subDept != "-1" && subDept != "0") {
//     display += `
// and subdept=:subDept
// `;
//     binds.subDept = subDept;
//   }

//   if (categoryId && categoryId != "0") {
//     display += `
// and num_salary_categoryid=:categoryId
// `;
//     binds.categoryId = categoryId;
//   }

//   if (zoneId && zoneId != "0") {
//     display += `
// and NUM_SALARY_ZONE=:zoneId
// `;
//     binds.zoneId = zoneId;
//   }

//   display += `
// and rownum=1
// order by num_salary_empid,orderno
// `;

//   const TblsalaryDetail = await executeQuery(display, binds);

//   //==========================================================
//   // Salary Earnings
//   //==========================================================

//   let query1 = `
// select
// num_salary_empid EmpId,
// num_salarydtl_payheadid payheadid_E
// `;

//   if (Number(ulbId) === 751) {
//     query1 += `,
// PayHeadShortName Head_E
// `;
//   } else {
//     query1 += `,
// var_payheads_ename Head_E
// `;
//   }

//   query1 += `,
// var_paysubheads_type EarnType_E,
// num_payhead_subheadid SubHeadId_E,
// nvl(num_salarydtl_amount,0) Amount_E
// from view_paysheet
// where ulbid=:ulbId
// `;

//   query1 += `
// and num_salarydtl_payheadid not IN (367,676,677,218)
// `;

//   query1 += `
// and var_paysubheads_type='E'
// and num_salarydtl_amount>0
// and num_salary_empid=:empId
// and date_salary_saldate=:lstdate
// `;

//   if (deptId != 0) {
//     query1 += `
// and num_salary_deptid=:deptId
// `;
//   }

//   if (subDept && subDept != "-1" && subDept != "0") {
//     query1 += `
// and subdept=:subDept
// `;
//   }

//   if (categoryId && categoryId != "0") {
//     query1 += `
// and num_salary_categoryid=:categoryId
// `;
//   }

//   if (zoneId && zoneId != "0") {
//     query1 += `
// and NUM_SALARY_ZONE=:zoneId
// `;
//   }

//   query1 += `
// order by num_salary_empid,orderno
// `;

//   const Salaryearning = await executeQuery(query1, binds);

//   let QueryDec = `
// SELECT
//     num_salary_empid EmpId,
//     num_payheads_id payheadid_D
// `;

//   if (Number(ulbId) === 751) {
//     QueryDec += `,
// PayHeadShortName Head_D
// `;
//   } else {
//     QueryDec += `,
// var_payheads_ename Head_D
// `;
//   }

//   QueryDec += `,
// var_paysubheads_type EarnType_D,
// num_payhead_subheadid subheadid_D,
// nvl(num_salarydtl_amount,0) Amount_D
// FROM view_paysheet
// where ulbid=:ulbId
// and var_paysubheads_type='D'
// and num_salarydtl_amount>0
// `;

//   QueryDec += `
// and num_salarydtl_payheadid not IN (367,676,677,218)
// `;

//   QueryDec += `
// and num_salary_empid=:empId
// and date_salary_saldate=:lstdate
// `;

//   if (deptId != 0) {
//     QueryDec += `
// and num_salary_deptid=:deptId
// `;
//   }

//   if (subDept && subDept != "-1" && subDept != "0") {
//     QueryDec += `
// and subdept=:subDept
// `;
//   }

//   if (categoryId && categoryId != "0") {
//     QueryDec += `
// and num_salary_categoryid=:categoryId
// `;
//   }

//   if (zoneId && zoneId != "0") {
//     QueryDec += `
// and NUM_SALARY_ZONE=:zoneId
// `;
//   }

//   if (Number(ulbId) === 751) {
//     QueryDec += `
// group by
// num_salary_empid,
// orderno,
// num_payheads_id,
// PayHeadShortName,
// var_paysubheads_type,
// num_payhead_subheadid,
// num_salarydtl_amount
// `;
//   } else {
//     QueryDec += `
// group by
// num_salary_empid,
// orderno,
// num_payheads_id,
// var_payheads_ename,
// var_paysubheads_type,
// num_payhead_subheadid,
// num_salarydtl_amount
// `;
//   }

//   QueryDec += `
// order by num_salary_empid,orderno
// `;

//   const Salarydeduction = await executeQuery(QueryDec, binds);

//   //--------------------------------------------------------
//   // Merge Result
//   //--------------------------------------------------------

//   const salaryDetails = TblsalaryDetail.rows;

//   const earnings = Salaryearning.rows;

//   const deductions = Salarydeduction.rows;

//   const maxRows = Math.max(salaryDetails.length, earnings.length, deductions.length);

//   const finalData = [];

//   for (let i = 0; i < maxRows; i++) {
//     let row = {};

//     if (salaryDetails[i]) {
//       row = {
//         ...salaryDetails[i],
//       };
//     }

//     row.Earning_Head = earnings[i]?.HEAD_E || null;

//     row.Earning_Amount = earnings[i]?.AMOUNT_E || 0;

//     row.Deduction_Head = deductions[i]?.HEAD_D || null;

//     row.Deduction_Amount = deductions[i]?.AMOUNT_D || 0;

//     finalData.push(row);
//   }

//   return {
//     rows: finalData,
//   };
// };

const getAMCPaySlip = async ({ ulbId, empId, oldEmpNo, deptId, subDept, categoryId, zoneId, month, year }) => {
  //--------------------------------------------------
  // Last Date
  //--------------------------------------------------

  const lastDate = new Date(Number(year), Number(month), 0);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const lstdate = `${String(lastDate.getDate()).padStart(2, "0")}-${monthNames[lastDate.getMonth()]}-${lastDate.getFullYear()}`;

  //--------------------------------------------------
  // Query
  //--------------------------------------------------

  let query = `
      SELECT *
      FROM vw_amcpayslip
      WHERE 1 = 1
      AND ulbid = :ulbId
      AND saldate = :lstdate
  `;

  const binds = {
    ulbId,
    lstdate,
  };

  //--------------------------------------------------
  // Employee
  //--------------------------------------------------

  if (empId) {
    query += `
      AND empid = :empId
    `;

    binds.empId = empId;
  }

  //--------------------------------------------------
  // Old Employee No
  //--------------------------------------------------

  if (oldEmpNo) {
    query += `
      AND oldempno = :oldEmpNo
    `;

    binds.oldEmpNo = oldEmpNo;
  }

  //--------------------------------------------------
  // Zone
  //--------------------------------------------------

  if (zoneId && zoneId !== "0") {
    query += `
      AND zoneid = :zoneId
    `;

    binds.zoneId = zoneId;
  }

  //--------------------------------------------------
  // Department
  //--------------------------------------------------

  if (deptId && deptId !== "0" && deptId !== "-1") {
    query += `
      AND deptid = :deptId
    `;

    binds.deptId = deptId;
  }

  //--------------------------------------------------
  // Sub Department
  //--------------------------------------------------

  if (subDept && subDept !== "" && subDept !== "-1" && subDept !== "0") {
    query += `
      AND subdept = :subDept
    `;

    binds.subDept = subDept;
  }

  //--------------------------------------------------
  // Category
  //--------------------------------------------------

  if (categoryId && categoryId !== "0") {
    query += `
      AND categoryid = :categoryId
    `;

    binds.categoryId = categoryId;
  }

  //--------------------------------------------------
  // Execute
  //--------------------------------------------------

  const result = await executeQuery(query, binds);

  return result.rows;
};

const getPaySlipData = async ({ ulbId, empId, deptId, subDept, categoryId, zoneId, month, year }) => {
  //----------------------------------------------------
  // Last Date
  //----------------------------------------------------

  const lastDate = new Date(Number(year), Number(month), 0);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const lstdate = `${String(lastDate.getDate()).padStart(2, "0")}-${monthNames[lastDate.getMonth()]}-${lastDate.getFullYear()}`;

  const binds = {
    ulbId,
    lstdate,
  };

  //----------------------------------------------------
  // Query
  //----------------------------------------------------

  let query = `
SELECT
    num_salary_empid EmpId,

    var_employee_engname EmpEName,

    var_employee_marname EmpMName,

    date_salary_saldate SalDate,

    var_desigmst_designationname Designation,

    var_deptmst_deptnamee Dept,

    var_grademst_gradename Grade,

    num_salary_presentdays,

    total_days,

    zonename,

    empbankno,

    emppanno,

    emppfno,

    num_salary_basic,

    num_salary_gradepay,

    panno,

    billcode,

    empsequence,

    withoutpay,

    medicalleave,

    earnedleave,

    halfday,

    oldempno,

    var_paysubheads_type,

    PayHeadShortName,

    var_payheads_ename,

    NVL(num_salarydtl_amount,0) Amount

FROM view_paysheet

WHERE ulbid = :ulbId

AND num_salarydtl_payheadid NOT IN
(
367,
676,
677,
218
)

AND var_paysubheads_type IN
(
'D',
'E'
)

AND num_salarydtl_amount > 0
`;

  //----------------------------------------------------
  // Employee
  //----------------------------------------------------

  if (empId) {
    query += `
AND num_salary_empid = :empId
`;

    binds.empId = empId;
  }

  //----------------------------------------------------
  // Salary Date
  //----------------------------------------------------

  query += `
AND date_salary_saldate = :lstdate
`;

  //----------------------------------------------------
  // Department
  //----------------------------------------------------

  if (deptId && deptId !== "0" && deptId !== "-1" && deptId !== "") {
    query += `
AND num_salary_deptid = :deptId
`;

    binds.deptId = deptId;
  }

  //----------------------------------------------------
  // Sub Department
  //----------------------------------------------------

  if (subDept && subDept !== "" && subDept !== "-1" && subDept !== "0") {
    query += `
AND subdept = :subDept
`;

    binds.subDept = subDept;
  }

  //----------------------------------------------------
  // Category
  //----------------------------------------------------

  if (categoryId && categoryId !== "0") {
    query += `
AND num_salary_categoryid = :categoryId
`;

    binds.categoryId = categoryId;
  }

  //----------------------------------------------------
  // Zone
  //----------------------------------------------------

  if (zoneId && zoneId !== "0") {
    query += `
AND NUM_SALARY_ZONE = :zoneId
`;

    binds.zoneId = zoneId;
  }

  //----------------------------------------------------
  // Order
  //----------------------------------------------------

  query += `
ORDER BY
num_salary_empid,
orderno
`;

  return await executeQuery(query, binds);
};

const buildFinalPaySlip = (source, ulbId) => {
  //----------------------------------------------------
  // Employee Grouping
  //----------------------------------------------------

  const employeeMap = new Map();

  source.forEach((row) => {
    const empId = row.EMPID;

    //--------------------------------------------------
    // First Row of Employee
    //--------------------------------------------------

    if (!employeeMap.has(empId)) {
      employeeMap.set(empId, {
        EmpId: row.EMPID,

        EmpEName: row.EMPENAME,

        EmpMName: row.EMPMNAME,

        SalDate: row.SALDATE,

        Designation: row.DESIGNATION,

        Dept: row.DEPT,

        Grade: row.GRADE,

        num_salary_presentdays: row.NUM_SALARY_PRESENTDAYS,

        total_days: row.TOTAL_DAYS,

        zonename: row.ZONENAME,

        empbankno: row.EMPBANKNO,

        emppanno: row.EMPPANNO,

        emppfno: row.EMPPFNO,

        num_salary_basic: row.NUM_SALARY_BASIC,

        num_salary_gradepay: row.NUM_SALARY_GRADEPAY,

        panno: row.PANNO,

        billcode: row.BILLCODE,

        empsequence: row.EMPSEQUENCE,

        withoutpay: row.WITHOUTPAY,

        medicalleave: row.MEDICALLEAVE,

        earnedleave: row.EARNEDLEAVE,

        halfday: row.HALFDAY,

        oldempno: row.OLDEMPNO,

        earnings: [],

        deductions: [],
      });
    }

    const employee = employeeMap.get(empId);

    //--------------------------------------------------
    // Earnings
    //--------------------------------------------------

    if (row.VAR_PAYSUBHEADS_TYPE === "E") {
      employee.earnings.push({
        head: Number(ulbId) === 870 ? row.PAYHEADSHORTNAME : row.VAR_PAYHEADS_ENAME,

        amount: Number(row.AMOUNT),
      });
    }

    //--------------------------------------------------
    // Deductions
    //--------------------------------------------------

    if (row.VAR_PAYSUBHEADS_TYPE === "D") {
      employee.deductions.push({
        head: Number(ulbId) === 870 ? row.PAYHEADSHORTNAME : row.VAR_PAYHEADS_ENAME,

        amount: Number(row.AMOUNT),
      });
    }
  });

  //----------------------------------------------------
  // Convert Map → Array
  //----------------------------------------------------

  const employees = [...employeeMap.values()];

  //----------------------------------------------------
  // Calculate Totals
  //----------------------------------------------------

  employees.forEach((emp) => {
    emp.grossSalary = emp.earnings.reduce((sum, e) => sum + e.amount, 0);

    emp.totalDeduction = emp.deductions.reduce((sum, d) => sum + d.amount, 0);

    emp.netSalary = emp.grossSalary - emp.totalDeduction;
  });

  return employees;
};

const getLeaveDetails = async ({ ulbId, employees, month, year }) => {
  //----------------------------------------------------
  // No Employees
  //----------------------------------------------------

  if (!employees || employees.length === 0) {
    return [];
  }

  //----------------------------------------------------
  // Employee Id List
  //----------------------------------------------------

  const empIds = employees.map((e) => e.EmpId).join(",");

  //----------------------------------------------------
  // Last Date
  //----------------------------------------------------

  const lastDate = new Date(Number(year), Number(month), 0);

  const sqlDate = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, "0")}-${String(lastDate.getDate()).padStart(2, "0")}`;

  //----------------------------------------------------
  // Query
  //----------------------------------------------------

  const query = `
WITH month_range AS
(
SELECT

ADD_MONTHS(
TRUNC(lb.DATE_LEAVE_FROMDATE,'MM'),
LEVEL-1
) AS month_start,

LAST_DAY(
ADD_MONTHS(
TRUNC(lb.DATE_LEAVE_FROMDATE,'MM'),
LEVEL-1
)
) AS month_end,

lb.NUM_LEAVE_ID,

lb.NUM_LEAVE_ULBID,

lb.NUM_LEAVE_EMPID,

lb.VAR_LEAVE_TYPE,

lb.VAR_LEAVE_ISHALFDAYLEAVE,

lb.DATE_LEAVE_FROMDATE,

lb.DATE_LEAVE_TODATE

FROM AOPR_LEAVEBALANCE_MST lb

WHERE lb.NUM_LEAVE_EMPID IN (${empIds})

AND lb.NUM_LEAVE_ULBID = :ulbId

AND TRIM(lb.VAR_LEAVE_LEAVESTATUS)='A'

CONNECT BY LEVEL <=

MONTHS_BETWEEN(

TRUNC(lb.DATE_LEAVE_TODATE,'MM'),

TRUNC(lb.DATE_LEAVE_FROMDATE,'MM')

)+1

AND PRIOR lb.NUM_LEAVE_ID=lb.NUM_LEAVE_ID

AND PRIOR SYS_GUID() IS NOT NULL
)

SELECT

mr.NUM_LEAVE_ID leaveid,

mr.NUM_LEAVE_EMPID empid,

lc.leave_name leavename,

GREATEST(

TRUNC(mr.DATE_LEAVE_FROMDATE),

mr.month_start

) AS month_fromdate,

LEAST(

TRUNC(mr.DATE_LEAVE_TODATE),

mr.month_end

) AS month_todate,

CASE

WHEN mr.VAR_LEAVE_ISHALFDAYLEAVE='Y'

THEN 0.5

ELSE

LEAST(

TRUNC(mr.DATE_LEAVE_TODATE),

mr.month_end

)

-

GREATEST(

TRUNC(mr.DATE_LEAVE_FROMDATE),

mr.month_start

)

+1

END AS leave_days_in_month

FROM month_range mr

JOIN vw_leaveconf lc

ON lc.leaveid = mr.VAR_LEAVE_TYPE

AND lc.ulbid = mr.NUM_LEAVE_ULBID

WHERE mr.month_start BETWEEN

TRUNC(DATE '${sqlDate}','MM')

AND LAST_DAY(DATE '${sqlDate}')

ORDER BY

mr.NUM_LEAVE_ID,

mr.month_start
`;

  //----------------------------------------------------
  // Execute
  //----------------------------------------------------

  const result = await executeQuery(query, {
    ulbId,
  });

  return result.rows;
};

// =============================================
// Main Function
// =============================================
const getPaySlip = async (filters) => {
  //--------------------------------------------------
  // ULB = 2
  //--------------------------------------------------

  if (Number(filters.ulbId) === 2) {
    const rows = await getAMCPaySlip(filters);

    return {
      reportType: "AMC",
      rows,
    };
  }

  //--------------------------------------------------
  // Normal Pay Slip Data
  //--------------------------------------------------

  const result = await getPaySlipData(filters);

  const source = result.rows;

  if (!source || source.length === 0) {
    return {
      reportType: "NORMAL",
      employees: [],
      leaveDetails: [],
    };
  }

  //--------------------------------------------------
  // Build Final Data
  //--------------------------------------------------

  const employees = buildFinalPaySlip(source, filters.ulbId);
 // console.log("Employees : ", employees);
  //--------------------------------------------------
  // ULB = 4 Leave Details
  //--------------------------------------------------

  let leaveDetails = [];

  if (Number(filters.ulbId) === 4) {
    leaveDetails = await getLeaveDetails({
      ulbId: filters.ulbId,

      employees,

      month: filters.month,

      year: filters.year,
    });
  }
  //--------------------------------------------------
  // Return
  //--------------------------------------------------

  return {
    reportType: "NORMAL",

    employees,

    leaveDetails,
  };
};

module.exports = {
  getEmployeeDetails,
  getAMCPaySlip,
  getPaySlipData,
  buildFinalPaySlip,
  getLeaveDetails,
  getPaySlip,
};
