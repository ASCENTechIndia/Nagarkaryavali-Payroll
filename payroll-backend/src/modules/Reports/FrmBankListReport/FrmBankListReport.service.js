const repo = require("./FrmBankListReport.repo");
const { AppError } = require("../../../libs/errors");

async function getDepartmentListService({ ulbid }) {
  if (!ulbid) throw new AppError("ulbid is required", 400);

  const data = await repo.getDepartmentListRepo({ ulbid: Number(ulbid) });
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getBankListService({ ulbid }) {
  if (!ulbid) throw new AppError("ulbid is required", 400);

  const data = await repo.getBankListRepo({ ulbid: Number(ulbid) });
  return {
    success: true,
    count: data.length,
    data,
  };
}

/**
 * Get the Bank List report data
 * @param {object} params
 * @param {number|string} params.ulbid
 * @param {number|string} params.month  - 1..12
 * @param {number|string} params.year   - e.g. 2026
 * @param {string}        params.deptId - "-1" means ALL
 * @param {string}        params.bankId - "-1" means ALL
 * @param {string}        [params.subdeptId] - optional, "-1" means ALL
 */



async function getBankListReportService({
    ulbid,
    month,
    year,
    deptId,
    bankId,
    subdeptId,
    billNo,
    empType,
    userId,
}) {
    // ==========================================
    // 1. VALIDATION
    // ==========================================

    if (!ulbid) {
        throw new AppError("ulbid is required", 400);
    }

    if (!month) {
        throw new AppError("Please select Month", 400);
    }

    if (!year) {
        throw new AppError("Please select Year", 400);
    }

    const m = Number(month);
    const y = Number(year);
    const ulbID = Number(ulbid);

    if (!Number.isInteger(m) || m < 1 || m > 12) {
        throw new AppError("Invalid month value", 400);
    }

    if (!Number.isInteger(y) || y < 2000) {
        throw new AppError("Invalid year value", 400);
    }

    if ([930, 1750].includes(ulbID) && !userId) {
        throw new AppError(
            "User ID is required to generate this report",
            400
        );
    }

    const normalizedEmpType = String(empType ?? "NEW")
        .trim()
        .toUpperCase();

    if (
        ulbID === 1750 &&
        !["OLD", "NEW"].includes(normalizedEmpType)
    ) {
        throw new AppError("Please select Employee Type", 400);
    }

    // ==========================================
    // 2. SALARY LAST DATE
    // ==========================================

    const lastDay = new Date(y, m, 0).getDate();

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr",
        "May", "Jun", "Jul", "Aug",
        "Sep", "Oct", "Nov", "Dec"
    ];

    const lastDate =
        `${String(lastDay).padStart(2, "0")}-${monthNames[m - 1]}-${y}`;

    // ==========================================
    // 3. NORMALIZE FILTERS
    // ==========================================

    const normalizedDeptId = deptId ?? "-1";
    const normalizedBankId = bankId ?? "-1";
    const normalizedSubdeptId = subdeptId ?? "-1";
    const normalizedBillNo = billNo ?? "-1";

    // ==========================================
    // 4. FETCH DATA FROM ORACLE
    // ==========================================

    const data = await repo.getBankListReportRepo({
        ulbid: ulbID,
        lastDate,
        deptId: normalizedDeptId,
        bankId: normalizedBankId,
        subdeptId: normalizedSubdeptId,
        billNo: normalizedBillNo,
        empType: normalizedEmpType,
        userId,
    });

    if (!data || data.length === 0) {
        throw new AppError("No Record Found", 404);
    }

    // ==========================================
    // 5. ORACLE COLUMN NAME HANDLING
    // ==========================================

    const getValue = (row, column) => {
        if (!row) return null;

        const key = Object.keys(row).find(
            k => k.toUpperCase() === column.toUpperCase()
        );

        return key !== undefined ? row[key] : null;
    };

    const getAmount = (row) => {
        const value = getValue(row, "PAYABLEAMT");

        if (value === null || value === undefined || value === "") {
            return 0;
        }

        const amount = Number(value);

        return Number.isFinite(amount) ? amount : 0;
    };

    const hasAccount = (value) => {
        if (value === null || value === undefined) {
            return false;
        }

        const account = String(value).trim();

        return account !== "" && account !== "-";
    };

    // ==========================================
    // 6. PAYMENT SUMMARY CALCULATION
    // ==========================================

    let totalPayable = 0;
    let cashCheque = 0;
    let indianBankPayment = 0;
    let axisBankPayment = 0;

    data.forEach((row) => {

        const amount = getAmount(row);

        const bankIdValue = getValue(row, "BANKID");
        const bankId = Number(bankIdValue);

        const indianAccount = getValue(row, "INDACCNO");
        const axisAccount = getValue(row, "AXISACCNO");
        const generalAccount = getValue(row, "ACCNO");

        // Raw account field can be used as a fallback
        const rawAccount = getValue(row, "BANKACCOUNTNO");

        totalPayable += amount;

        if (ulbID === 1750) {

            // AXIS BANK - BANK ID 2
            if (
                bankId === 2 &&
                (
                    hasAccount(axisAccount) ||
                    hasAccount(rawAccount)
                )
            ) {
                axisBankPayment += amount;
            }

            // INDIAN BANK - BANK ID OTHER THAN 2
            else if (
                bankIdValue !== null &&
                bankIdValue !== undefined &&
                bankId !== 2 &&
                (
                    hasAccount(indianAccount) ||
                    hasAccount(rawAccount)
                )
            ) {
                indianBankPayment += amount;
            }

            // NO VALID BANK ACCOUNT
            else if (
                !hasAccount(axisAccount) &&
                !hasAccount(indianAccount) &&
                !hasAccount(rawAccount)
            ) {
                cashCheque += amount;
            }

            // Fallback: account exists but bank ID is missing
            else if (hasAccount(axisAccount)) {
                axisBankPayment += amount;
            }
            else if (hasAccount(indianAccount)) {
                indianBankPayment += amount;
            }
            else {
                cashCheque += amount;
            }

        } else {

            // OTHER ULBs
            // Preserve existing general account logic.
            if (!hasAccount(generalAccount)) {
                cashCheque += amount;
            } else {
                indianBankPayment += amount;
            }
        }
    });

    // ==========================================
    // 7. ROUND PAYMENT VALUES
    // ==========================================

    const roundAmount = (value) =>
        Number(value.toFixed(2));

    totalPayable = roundAmount(totalPayable);
    cashCheque = roundAmount(cashCheque);
    indianBankPayment = roundAmount(indianBankPayment);
    axisBankPayment = roundAmount(axisBankPayment);

    // ==========================================
    // 8. PAYMENT SUMMARY VALIDATION
    // ==========================================

    const summaryTotal = roundAmount(
        cashCheque +
        indianBankPayment +
        axisBankPayment
    );

    console.log("========== BANK LIST REPORT ==========");

    console.log({
        ulbid: ulbID,
        salaryMonth: `${monthNames[m - 1]} ${y}`,
        totalRecords: data.length,
        totalPayable,
        cashCheque,
        indianBankPayment,
        axisBankPayment,
        summaryTotal,
        summaryMatches:
            summaryTotal === totalPayable
    });

    console.log("FIRST EMPLOYEE ROW:", data[0]);

    console.log("======================================");

    // ==========================================
    // 9. FINAL RESPONSE
    // ==========================================

    return {
        success: true,

        count: data.length,

        // All employee records
        data: data,

        // Salary period
        salaryMonth: `${monthNames[m - 1]} ${y}`,

        // Payment summary for PDF
        paymentSummary: {
            cashCheque: cashCheque,
            indianBankPayment: indianBankPayment,
            axisBankPayment: axisBankPayment,
            grandTotal: totalPayable
        },

        // Backward compatibility
        cashCheque: cashCheque,
        indianBankPayment: indianBankPayment,
        axisBankPayment: axisBankPayment,
        totalPayable: totalPayable,
        grandTotal: totalPayable,

        // Selected filters
        filters: {
            ulbid: ulbID,
            month: m,
            year: y,
            lastDate: lastDate,
            deptId: normalizedDeptId,
            bankId: normalizedBankId,
            subdeptId: normalizedSubdeptId,
            billNo: normalizedBillNo,
            empType: normalizedEmpType
        }
    };
}


module.exports = {
  getDepartmentListService,
  getBankListService,
  getBankListReportService,
};
