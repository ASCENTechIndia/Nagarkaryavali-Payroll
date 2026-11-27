const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmCashNCheckRpt.service");
const {
    CashReportPDFHelper,
    DcpsReportPDFHelper,
    ManualPayslipPDFHelper,
} = require("../../../utils/pdfHelper/FrmCashNCheckRpt");
const { getCorporationService } = require("../../MenuAccess/MenuAccess.service");
const path = require("path");

exports.getDepartmentList = asyncHandler(async (req, res) => {
    const { ulbid, ulbId } = req.body;
    const resolvedUlbId = ulbid ?? ulbId ?? req.user?.ulbId ?? req.user?.orgId;
    const data = await service.getDepartmentListService({ ulbid: resolvedUlbId });
    return ok(res, data, "Department list fetched successfully");
});

exports.getPaymodeList = asyncHandler(async (req, res) => {
    const data = service.getPaymodeListService();
    return ok(res, data, "Paymode list fetched successfully");
});

exports.generateReport = asyncHandler(async (req, res) => {
    const {
        ulbid,
        ulbId,
        reportType = "Cash",
        month,
        year,
        deptId = "-1",
        deptName,
        paymode = "-1",
        paymodeName,
        empType = "NEW",
        fileFormat = "PDF",
    } = req.body;

    const resolvedUlbId = ulbid ?? ulbId ?? req.user?.ulbId ?? req.user?.orgId;
    const resolvedFormat = String(fileFormat || "PDF").toUpperCase();

    const reportResult = await service.generateReportService({
        ulbid: resolvedUlbId,
        reportType,
        month,
        year,
        deptId,
        paymode,
        empType,
    });

    let corporationName = "";
    let corporationLogo = "";
    let corpInfo = null;
    try {
        corpInfo = await getCorporationService({ ulbId: resolvedUlbId });
        corporationName = corpInfo.ABC_MUNICIPAL_TEXT || "";
        corporationLogo = corpInfo.ULBLOGO || "";
    } catch (_) {
        corporationName = "";
        corporationLogo = "";
    }

    const userId = req.user?.name || req.user?.sub || "";

    // For Cash / DCPS EXCEL export, return rows + metadata for frontend XLSX export
    if (resolvedFormat === "EXCEL" && (reportType === "Cash" || reportType === "DCPS")) {
        return res.json({
            success: true,
            fileFormat: "EXCEL",
            reportType,
            salaryMonth: reportResult.salaryMonth,
            corporationName,
            deptName: deptName || (String(deptId) === "-1" ? "All" : deptId),
            paymodeName: paymodeName || (String(paymode) === "-1" ? "All" : paymode),
            count: reportResult.data.length,
            data: reportResult.data,
        });
    }

    let pdf;
    if (reportType === "Cash") {
        pdf = await CashReportPDFHelper({
            rows: reportResult.data,
            salaryMonth: reportResult.salaryMonth,
            department: deptName || (String(deptId) === "-1" ? "All" : deptId),
            paymode: paymodeName || (String(paymode) === "-1" ? "All" : paymode),
            corporationName,
            userId,
        });
    } else if (reportType === "DCPS") {
        pdf = await DcpsReportPDFHelper({
            rows: reportResult.data,
            salaryMonth: reportResult.salaryMonth,
            corporationName,
            userId,
        });
    } else {
        pdf = await ManualPayslipPDFHelper({
            employees: reportResult.employees,
            salaryMonthDash: reportResult.salaryMonthDash,
            paidDate: reportResult.paidDate,
            corporationName,
            corporationAddress: reportResult.corporationAddress || "",
            corporationLogo,
        });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const pdfUrl = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

    return res.json({
        success: true,
        fileFormat: "PDF",
        message: `${reportType} Report Generated Successfully`,
        fileName: pdf.fileName,
        pdfUrl,
    });
});
