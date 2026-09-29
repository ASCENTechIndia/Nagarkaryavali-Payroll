const repo = require("./FrmBankListReport.repo");

async function getDepartmentListService({ ulbid }) {
    if (!ulbid) throw new Error("ulbid is required");

    const data = await repo.getDepartmentListRepo({ ulbid: Number(ulbid) });
    return {
        success: true,
        count: data.length,
        data,
    };
}

async function getBankListService({ ulbid }) {
    if (!ulbid) throw new Error("ulbid is required");

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
async function getBankListReportService({ ulbid, month, year, deptId, bankId, subdeptId }) {
   
    if (!ulbid)  throw new Error("ulbid is required");
    if (!month)  throw new Error("Please select Month");
    if (!year)   throw new Error("Please select Year");

    const m = Number(month);
    const y = Number(year);

    if (isNaN(m) || m < 1 || m > 12) throw new Error("Invalid month value");
    if (isNaN(y) || y < 2000)        throw new Error("Invalid year value");

    
    const lastDay = new Date(y, m, 0).getDate(); 
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const lastDate = `${String(lastDay).padStart(2, "0")}-${monthNames[m - 1]}-${y}`;

    const data = await repo.getBankListReportRepo({
        ulbid:    Number(ulbid),
        lastDate,
        deptId:   deptId   || "-1",
        bankId:   bankId   || "-1",
        subdeptId: subdeptId || "-1",
    });

    if (!data || data.length === 0) {
        throw new Error("No Record Found");
    }

    const totalPayable = data.reduce((sum, row) => sum + (Number(row.PAYABLEAMT) || 0), 0);

    return {
        success: true,
        count: data.length,
        totalPayable,
        salaryMonth: `${monthNames[m - 1]} ${y}`,
        data,
        filters: {
            ulbid,
            month: m,
            year:  y,
            lastDate,
            deptId:    deptId   || "-1",
            bankId:    bankId   || "-1",
            subdeptId: subdeptId || "-1",
        },
    };
}

module.exports = {
    getDepartmentListService,
    getBankListService,
    getBankListReportService,
};
