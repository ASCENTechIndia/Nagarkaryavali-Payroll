const repo = require("./FrmBillGeneration.repo");

/**
 * ==========================================================
 * Generate Bill
 * ==========================================================
 */
async function generateBillService(payload) {
    console.log("📥 Service : Generate Bill");

    return await repo.generateBillRepo(payload);
}

/**
 * ==========================================================
 * Detail Report
 * ==========================================================
 */
async function getDetailReportService(payload) {

    const report = await repo.getDetailReportRepo(payload);

    return {
        success: true,

        salDate: payload.salDate,

        department: report.department || "",

        billNo: report.billNo || report.subDetail?.[0]?.BILLNO || "",

        detail: report.detail,

        subDetail: report.subDetail,

        netEarning: report.netEarning,

        netDeduction: report.netDeduction,

        netPayable: report.netPayable
    };
}

/**
 * ==========================================================
 * Summary Report
 * ==========================================================
 */
async function getSummaryReportService(payload) {
    console.log("📥 Service : Summary Report");

    const report = await repo.getSummaryReportRepo(payload);

    return {
        success: true,

        salDate: payload.salDate,

        department: report.department || payload.deptid,

        billNo: report.billNo || report.summary?.[0]?.BILLNO || "",

        summary: report.summary,

        netEarning: report.netEarning,

        netDeduction: report.netDeduction,

        netPayable: report.netPayable
    };
}


async function insertBillService(payload) {

    const result = await repo.insertBillRepo(payload);

    return result;

}

module.exports = {
    generateBillService,
    getDetailReportService,
    getSummaryReportService,
    insertBillService
};