const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const XLSX = require("xlsx");
const { withTx } = require("../../../db/tx");

// ===============================
// Get Pay Head List
// ===============================
const getPayHeadList = async (ulbId) => {
  const query = `
        SELECT
            num_payheads_id AS value,
            ${Number(ulbId) === 751 || Number(ulbId) === 870 ? "var_payheads_shortname" : "var_payheads_ename"} AS label
        FROM aopr_payheads_def
        WHERE num_payheads_ulbid = :ulbId
          AND num_payhead_subheadid = 55
        ORDER BY 2
    `;

  return await executeQuery(query, { ulbId });
};

// ===============================
// Get Department List
// ===============================
const getDepartmentList = async (ulbId) => {
  const query = `
        SELECT
            deptid AS value,
            deptname AS label
        FROM vw_deptconfig_new
        WHERE ulbid = :ulbId
        ORDER BY deptname
    `;

  return await executeQuery(query, { ulbId });
};

// ===============================
// Get Year List
// ===============================
const getYearList = async () => {
  const query = `
        SELECT
            num_year_id AS value,
            var_year AS label
        FROM aopr_year_mas
        ORDER BY num_year_id
    `;

  return await executeQuery(query);
};

// ===============================
// Download Excel Data
// ===============================
const getMonthlyBankDeductionExcelData = async ({ ulbId, payHeadId, departmentId, month, year, employeeStatus }) => {
  let query = `
        WITH cte_monthyear AS
        (
            SELECT TO_CHAR(
                    TO_DATE(LPAD(:month,2,'0') || '-' || :year,'MM-YYYY'),
                    'MON-YYYY'
                  ) Salary_Month_Year
            FROM dual
        )

        SELECT
            num_employee_empid Employee_Code,
            var_employee_engname Employee_Name,
            deptname Department,
            c.Salary_Month_Year,
            CASE
                WHEN num_payheads_ulbid NOT IN (870,751)
                THEN var_payheads_ename
                ELSE var_payheads_shortname
            END Deduction_Payhead,
            NULL Deduction_Amount,
            NULL Remarks

        FROM aopr_employee_def

        INNER JOIN vw_deptconfig
            ON ulbid = num_employee_ulbid
           AND deptid = num_employee_deptid

        INNER JOIN aopr_payheads_def
            ON num_payheads_ulbid = num_employee_ulbid

        CROSS JOIN cte_monthyear c

        WHERE num_employee_ulbid = :ulbId
          AND num_payheads_id = :payHeadId
          AND var_employee_emptype = :employeeStatus
    `;

  const binds = {
    ulbId,
    payHeadId,
    month,
    year,
    employeeStatus,
  };

  if (departmentId && departmentId != -1) {
    query += ` AND num_employee_deptid = :departmentId`;
    binds.departmentId = departmentId;
  }

  query += ` ORDER BY Employee_Code`;

  return await executeQuery(query, binds);
};

const expectedHeaders = ["Employee_Code", "Employee_Name", "Department", "Salary_Month_Year", "Deduction_Payhead", "Deduction_Amount", "Remarks"];

function divideIntoParts(input, numParts = 10) {
  if (!input) return new Array(numParts).fill(null);

  const splitInput = input.split("#").filter((x) => x.trim() !== "");

  const totalElements = splitInput.length;

  const elementsPerPart = Math.floor(totalElements / numParts);

  let remainingElements = totalElements % numParts;

  let currentIndex = 0;

  const parts = [];

  for (let i = 0; i < numParts; i++) {
    const currentPartSize = elementsPerPart + (remainingElements > 0 ? 1 : 0);

    if (remainingElements > 0) remainingElements--;

    const currentPart = [];

    for (let j = 0; j < currentPartSize; j++) {
      if (currentIndex < splitInput.length) {
        currentPart.push(splitInput[currentIndex++]);
      }
    }

    if (currentPart.length === 0) {
      parts.push(null);
    } else if (i < numParts - 1) {
      parts.push(currentPart.join("#") + "#");
    } else {
      parts.push(currentPart.join("#"));
    }
  }

  return parts;
}

// async function uploadMonthlyBankDeductionRepo(file, data) {
//   try {
//     if (!file) {
//       return {
//         success: false,

//         error: "Please upload excel file.",
//       };
//     }

//     const workbook = XLSX.read(file.buffer, {
//       type: "buffer",
//     });

//     if (!workbook.SheetNames.length) {
//       return {
//         success: false,

//         error: "Worksheet not found.",
//       };
//     }

//     const worksheet = workbook.Sheets[workbook.SheetNames[0]];

//     const rows = XLSX.utils.sheet_to_json(worksheet, {
//       defval: "",
//       raw: false,
//     });

//     if (rows.length === 0) {
//       return {
//         success: false,

//         error: "Excel file is empty.",
//       };
//     }

//     const actualHeaders = Object.keys(rows[0]);

//     if (actualHeaders.length !== expectedHeaders.length) {
//       return {
//         success: false,

//         error: `Header count mismatch. Expected ${expectedHeaders.length} headers but found ${actualHeaders.length}.`,
//       };
//     }

//     for (let i = 0; i < expectedHeaders.length; i++) {
//       if (actualHeaders[i].trim() !== expectedHeaders[i]) {
//         return {
//           success: false,

//           error: `Header mismatch at column ${i + 1}. Expected '${expectedHeaders[i]}' but found '${actualHeaders[i]}'.`,
//         };
//       }
//     }

//     let stratt = "";

//     for (const row of rows) {
//       const empCode = String(row.Employee_Code || "").trim();

//       const empName = String(row.Employee_Name || "").trim();

//       const department = String(row.Department || "").trim();

//       const salaryMonthYear = String(row.Salary_Month_Year || "").trim();

//       const payHead = String(row.Deduction_Payhead || "").trim();

//       const amount = String(row.Deduction_Amount || "").trim();

//       const remarks = String(row.Remarks || "").trim();

//       if (salaryMonthYear && payHead) {
//         stratt += empCode + "$" + empName + "$" + department + "$" + salaryMonthYear + "$" + payHead + "$" + amount + "$" + remarks + "#";
//       }
//     }

//     if (!stratt.length) {
//       return {
//         success: false,

//         error: "No valid data found.",
//       };
//     }

//     stratt = stratt.slice(0, -1);

//     let parts = divideIntoParts(stratt, 10);

//     const result = await withTx(async (conn) => {
//       const res = await conn.execute(
//         `BEGIN
//             aopr_BulkDedHeadexcell_Ins(
//                 :in_userid,
//                 :in_id,
//                 :in_month,
//                 :in_year,
//                 :in_str,
//                 :in_str1,
//                 :in_str2,
//                 :in_str3,
//                 :in_str4,
//                 :in_str5,
//                 :in_str6,
//                 :in_str7,
//                 :in_str8,
//                 :in_str9,
//                 :in_mode,
//                 :out_errorcode,
//                 :out_errormsg
//             );
//          END;`,

//         {
//           in_userid: data.userId,

//           in_id: 0,

//           in_month: data.month,

//           in_year: data.year,

//           in_str: parts[0],

//           in_str1: parts[1],

//           in_str2: parts[2],

//           in_str3: parts[3],

//           in_str4: parts[4],

//           in_str5: parts[5],

//           in_str6: parts[6],

//           in_str7: parts[7],

//           in_str8: parts[8],

//           in_str9: parts[9],

//           in_mode: 1,

//           out_errorcode: {
//             dir: oracledb.BIND_OUT,
//             type: oracledb.NUMBER,
//           },

//           out_errormsg: {
//             dir: oracledb.BIND_OUT,
//             type: oracledb.STRING,
//             maxSize: 5000,
//           },
//         },
//       );

//       console.log("uploadMonthlyBankDeductionRepo", res.outBinds);

//       return res.outBinds;
//     });

//     return {
//       success: true,

//       errorCode: result.out_errorcode,

//       errorMsg: result.out_errormsg,
//     };
//   } catch (err) {
//     console.log(err);

//     return {
//       success: false,

//       error: err.message,
//     };
//   }
// }

async function uploadMonthlyBankDeductionRepo(file) {
  try {
    if (!file) {
      return {
        success: false,
        error: "Please upload excel file.",
      };
    }

    const workbook = XLSX.read(file.buffer, {
      type: "buffer",
    });

    if (!workbook.SheetNames.length) {
      return {
        success: false,
        error: "Worksheet not found.",
      };
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
      raw: false,
    });

    const normalizedRows = rows.map((row) => {
      const obj = {};

      for (const key of Object.keys(row)) {
        obj[key.trim().toUpperCase()] = row[key];
      }

      return obj;
    });

    if (rows.length === 0) {
      return {
        success: false,
        error: "Excel file is empty.",
      };
    }

    //----------------------------------------------------
    // Validate Header
    //----------------------------------------------------

    const actualHeaders = Object.keys(rows[0]);

    if (actualHeaders.length !== expectedHeaders.length) {
      return {
        success: false,
        error: `Header count mismatch. Expected ${expectedHeaders.length} headers but found ${actualHeaders.length}.`,
      };
    }

    for (let i = 0; i < expectedHeaders.length; i++) {
      if (actualHeaders[i].trim().toUpperCase() !== expectedHeaders[i].toUpperCase()) {
        return {
          success: false,
          error: `Header mismatch at column ${i + 1}. Expected '${expectedHeaders[i]}' but found '${actualHeaders[i]}'.`,
        };
      }
    }

    //----------------------------------------------------
    // Create DataTable (Array)
    //----------------------------------------------------

    const table = [];

    for (const row of normalizedRows) {
      //console.log(normalizedRows);

      const currentRow = {
        Employee_Code: String(row.EMPLOYEE_CODE || "").trim(),
        Employee_Name: String(row.EMPLOYEE_NAME || "").trim(),
        Department: String(row.DEPARTMENT || "").trim(),
        Salary_Month_Year: String(row.SALARY_MONTH_YEAR || "").trim(),
        Deduction_Payhead: String(row.DEDUCTION_PAYHEAD || "").trim(),
        Deduction_Amount: String(row.DEDUCTION_AMOUNT || "").trim(),
        Remarks: String(row.REMARKS || "").trim(),
      };

      const isEmpty = Object.values(currentRow).every((value) => value === "");

      if (!isEmpty) {
        table.push(currentRow);
      }
    }

    return {
      success: true,

      totalRows: table.length,

      data: table,
    };
  } catch (err) {
    console.log(err);

    return {
      success: false,

      error: err.message,
    };
  }
}

// ==========================================
// Divide String Into 10 Parts (Same as .NET)
// ==========================================
function divideIntoParts(input, numParts = 10) {
  if (!input) {
    return new Array(numParts).fill(null);
  }

  const splitInput = input
    .split("#")
    .filter((x) => x.trim() !== "");

  const totalElements = splitInput.length;

  const elementsPerPart = Math.floor(totalElements / numParts);

  let remainingElements = totalElements % numParts;

  let currentIndex = 0;

  const parts = [];

  for (let i = 0; i < numParts; i++) {
    const currentPartSize =
      elementsPerPart + (remainingElements > 0 ? 1 : 0);

    if (remainingElements > 0) remainingElements--;

    const currentPart = [];

    for (let j = 0; j < currentPartSize; j++) {
      if (currentIndex < splitInput.length) {
        currentPart.push(splitInput[currentIndex++]);
      }
    }

    if (currentPart.length === 0) {
      parts.push(null);
    } else if (i < numParts - 1) {
      parts.push(currentPart.join("#") + "#");
    } else {
      parts.push(currentPart.join("#"));
    }
  }

  return parts;
}

// ==========================================
// Submit Monthly Bank Deduction
// ==========================================
async function submitMonthlyBankDeductionRepo(data) {
  try {
    let parts = divideIntoParts(data.in_str, 10);

    // Same logic as .NET
    parts = parts.map((part, index) => {
      if (!part) return null;

      if (index < 9 && part.endsWith("#")) {
        return part.slice(0, -1);
      }

      return part;
    });

    const result = await withTx(async (conn) => {
      const res = await conn.execute(
        `BEGIN
            aopr_BulkDedHeadexcell_Ins(
                :in_userid,
                :in_id,
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
         END;`,
        {
          in_userid: data.userId,

          in_id: data.id || 0,

          in_month: data.month,

          in_year: data.year,

          in_str: parts[0],

          in_str1: parts[1],

          in_str2: parts[2],

          in_str3: parts[3],

          in_str4: parts[4],

          in_str5: parts[5],

          in_str6: parts[6],

          in_str7: parts[7],

          in_str8: parts[8],

          in_str9: parts[9],

          in_mode: data.mode || 1,

          out_errorcode: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER,
          },

          out_errormsg: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 5000,
          },
        }
      );

      console.log(
        "submitMonthlyBankDeductionRepo",
        res.outBinds
      );

      return res.outBinds;
    });

    return {
      success: true,
      errorCode: result.out_errorcode,
      errorMsg: result.out_errormsg,
    };
  } catch (err) {
    console.log(err);

    return {
      success: false,
      error: err.message,
    };
  }
}


module.exports = {
  getPayHeadList,
  getDepartmentList,
  getYearList,
  getMonthlyBankDeductionExcelData,
  uploadMonthlyBankDeductionRepo,
  submitMonthlyBankDeductionRepo,
};
