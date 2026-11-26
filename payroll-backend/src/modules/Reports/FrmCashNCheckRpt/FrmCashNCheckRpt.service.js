const repo = require("./FrmCashNCheckRpt.repo");
const payslipService = require("../FrmPayslip/FrmPayslip.service");
const { AppError } = require("../../../libs/errors");

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL_MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

async function getDepartmentListService({ ulbid }) {
    if (!ulbid) throw new AppError("ulbid is required", 400);

    const data = await repo.getDepartmentListRepo({ ulbid: Number(ulbid) });
    return {
        success: true,
        count: data.length,
        data,
    };
}

function getPaymodeListService() {
    // Matches .NET FrmCashNCheckRpt Page_Load: "-- ALL --" (-1) added in UI, "Cash" (1) from backend
    const data = [{ paymodeid: 1, paymode: "Cash" }];
    return {
        success: true,
        count: data.length,
        data,
    };
}

function buildLastDate(month, year) {
    const m = Number(month);
    const y = Number(year);

    if (isNaN(m) || m < 1 || m > 12) throw new AppError("Invalid month value", 400);
    if (isNaN(y) || y < 2000)        throw new AppError("Invalid year value", 400);

    const lastDay = new Date(y, m, 0).getDate();
    return {
        m,
        y,
        lstdate: `${String(lastDay).padStart(2, "0")}-${MONTH_NAMES[m - 1]}-${y}`,
        salaryMonth: `${FULL_MONTH_NAMES[m - 1]} ${y}`,
    };
}

async function generateReportService({
    ulbid,
    reportType = "Cash",
    month,
    year,
    deptId = "-1",
    paymode = "-1",
    empType = "NEW",
}) {
    if (!ulbid) throw new AppError("ulbid is required", 400);
    if (!month) throw new AppError("Please select Month", 400);
    if (!year)  throw new AppError("Please select Year", 400);

    const { m, y, lstdate, salaryMonth } = buildLastDate(month, year);
    const resolvedEmpType = (empType || "NEW").trim().toUpperCase();

    if (reportType === "Cash") {
        const data = await repo.getCashReportRepo({
            ulbid: Number(ulbid),
            lstdate,
            deptId,
            paymode,
            empType: resolvedEmpType,
        });

        if (!data || data.length === 0) {
            throw new AppError("No Record Found", 404);
        }

        return {
            reportType: "Cash",
            salaryMonth,
            lstdate,
            data,
            filters: {
                ulbid,
                month: m,
                year: y,
                deptId: deptId || "-1",
                paymode: paymode || "-1",
                empType: resolvedEmpType,
            },
        };
    }

    if (reportType === "DCPS") {
        const data = await repo.getDcpsReportRepo({
            ulbid: Number(ulbid),
            lstdate,
            empType: resolvedEmpType,
        });

        if (!data || data.length === 0) {
            throw new AppError("No Record Found", 404);
        }

        return {
            reportType: "DCPS",
            salaryMonth,
            lstdate,
            data,
            filters: {
                ulbid,
                month: m,
                year: y,
                empType: resolvedEmpType,
            },
        };
    }

    if (reportType === "Payslip") {
        const result = await payslipService.getPaySlipService({
            ulbId: Number(ulbid),
            deptId: deptId || "-1",
            month: m,
            year: y,
        });

        if (!result?.data || (result.data.reportType === "NORMAL" && (!result.data.employees || result.data.employees.length === 0))) {
            throw new AppError("No Records Found", 404);
        }

        if (result.data.reportType === "AMC") {
            throw new AppError("AMC Payslip PDF is not supported here.", 501);
        }

        return {
            reportType: "Payslip",
            salaryMonth,
            lstdate,
            employees: result.data.employees,
            leaveDetails: result.data.leaveDetails || [],
            filters: {
                ulbid,
                month: m,
                year: y,
                deptId: deptId || "-1",
                empType: resolvedEmpType,
            },
        };
    }

    throw new AppError("Invalid reportType. Expected Cash, DCPS, or Payslip.", 400);
}

module.exports = {
    getDepartmentListService,
    getPaymodeListService,
    generateReportService,
};
