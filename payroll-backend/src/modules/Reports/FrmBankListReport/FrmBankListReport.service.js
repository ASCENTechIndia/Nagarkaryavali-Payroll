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
    userId
}) {
    if (!ulbid) throw new AppError("ulbid is required", 400);
    if (!month) throw new AppError("Please select Month", 400);
    if (!year) throw new AppError("Please select Year", 400);

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
        throw new AppError("User ID is required to generate this report", 400);
    }

    if (ulbID === 1750 && !["OLD", "NEW"].includes(String(empType).trim().toUpperCase())) {
        throw new AppError("Please select Employee Type", 400);
    }

    const lastDay = new Date(y, m, 0).getDate();

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const lastDate = `${String(lastDay).padStart(2, "0")}-${monthNames[m - 1]}-${y}`;

    const normalizedDeptId = deptId ?? "-1";
    const normalizedBankId = bankId ?? "-1";
    const normalizedSubdeptId = subdeptId ?? "-1";
    const normalizedBillNo = billNo ?? "-1";
    const normalizedEmpType = String(empType ?? "NEW").trim().toUpperCase();

    const data = await repo.getBankListReportRepo({
        ulbid: ulbID,
        lastDate,
        deptId: normalizedDeptId,
        bankId: normalizedBankId,
        subdeptId: normalizedSubdeptId,
        billNo: normalizedBillNo,
        empType: normalizedEmpType,
        userId
    });

    if (!data || data.length === 0) {
        throw new AppError("No Record Found", 404);
    }

    const getAmount = (row) =>
        Number(row.PAYABLEAMT ?? row.payableamt) || 0;

    const hasAccount = (value) =>
        value != null &&
        String(value).trim() !== "" &&
        String(value).trim() !== "-";

    let totalPayable = 0;
    let cashCheque = 0;
    let indianBankPayment = 0;
    let axisBankPayment = 0;

    data.forEach((row) => {
        const amount = getAmount(row);

        const indianAcc = row.INDACCNO ?? row.indaccno;
        const axisAcc = row.AXISACCNO ?? row.axisaccno;
        const account = row.ACCNO ?? row.accno;

        totalPayable += amount;

        if (hasAccount(axisAcc)) {
            axisBankPayment += amount;
        } else if (hasAccount(indianAcc)) {
            indianBankPayment += amount;
        } else if (!hasAccount(account)) {
            cashCheque += amount;
        }
    });

    return {
        success: true,
        count: data.length,
        totalPayable,
        cashCheque,
        indianBankPayment,
        axisBankPayment,
        salaryMonth: `${monthNames[m - 1]} ${y}`,
        data,
        filters: {
            ulbid: ulbID,
            month: m,
            year: y,
            lastDate,
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
