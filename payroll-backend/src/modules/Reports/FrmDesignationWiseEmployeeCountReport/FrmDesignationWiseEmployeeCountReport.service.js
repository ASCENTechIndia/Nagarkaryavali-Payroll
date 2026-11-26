const repo = require("./FrmDesignationWiseEmployeeCountReport.repo");
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

/**
 * Get Designation-wise Employee Count report data
 * @param {object} params
 * @param {number|string} params.ulbid
 * @param {number|string} params.month   - 1..12
 * @param {number|string} params.year    - e.g. 2025
 * @param {string}        params.deptId  - "-1" means ALL
 * @param {string}        params.empType - "OLD" or "NEW"
 */
async function getDesigwiseEmpCountService({ ulbid, month, year, deptId, empType }) {
    if (!ulbid) throw new AppError("ulbid is required", 400);
    if (!month) throw new AppError("Please select Month", 400);
    if (!year)  throw new AppError("Please select Year", 400);

    const m = Number(month);
    const y = Number(year);

    if (isNaN(m) || m < 1 || m > 12) throw new AppError("Invalid month value", 400);
    if (isNaN(y) || y < 2000)        throw new AppError("Invalid year value", 400);

    // Build last day of selected month in 'dd-MMM-yyyy' format (Oracle date format)
    const lastDay = new Date(y, m, 0).getDate();
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const lstdate = `${String(lastDay).padStart(2, "0")}-${monthNames[m - 1]}-${y}`;

    const resolvedEmpType = (empType || "NEW").trim().toUpperCase();

    const data = await repo.getDesigwiseEmpCountRepo({
        ulbid:  Number(ulbid),
        deptId: deptId || "-1",
        lstdate,
    });

    if (!data || data.length === 0) {
        throw new AppError("No Record Found", 404);
    }

    return {
        success: true,
        count: data.length,
        salaryMonth: `${monthNames[m - 1]} ${y}`,
        salaryDate: lstdate,
        data,
        filters: {
            ulbid,
            month: m,
            year: y,
            lstdate,
            deptId:  deptId || "-1",
            empType: resolvedEmpType,
        },
    };
}

module.exports = {
    getDepartmentListService,
    getDesigwiseEmpCountService,
};
