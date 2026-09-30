const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmBankListReport.service");
const { BankListReportPDFHelper } = require("../../../utils/pdfHelper/FrmBankListReport");
const { getCorporationService } = require("../../MenuAccess/MenuAccess.service");
const path = require("path");

exports.getDepartmentList = asyncHandler(async (req, res) => {
    const { ulbid } = req.body;
    const data = await service.getDepartmentListService({ ulbid });
    return ok(res, data, "Department list fetched successfully");
});

exports.getBankList = asyncHandler(async (req, res) => {
    const { ulbid } = req.body;
    const data = await service.getBankListService({ ulbid });
    return ok(res, data, "Bank list fetched successfully");
});

exports.getBankListReport = asyncHandler(async (req, res) => {
    const { ulbid, ulbId, month, year, deptId, departmentId, bankId, subdeptId } = req.body;
    const data = await service.getBankListReportService({
        ulbid:    ulbid || ulbId,
        month,
        year,
        deptId:   deptId || departmentId,
        bankId,
        subdeptId,
    });
    return ok(res, data, "Bank List report fetched successfully");
});

exports.generateBankListPdf = asyncHandler(async (req, res) => {
    const {
        ulbid, ulbId, month, year,
        deptId, departmentId,
        deptName, bankName, subDeptName,
        bankId, subdeptId,
    } = req.body;

    const resolvedUlbId = ulbid || ulbId;
    const resolvedDeptId = deptId || departmentId || "-1";

    // Fetch report data
    const reportResult = await service.getBankListReportService({
        ulbid:    resolvedUlbId,
        month,
        year,
        deptId:   resolvedDeptId,
        bankId:   bankId || "-1",
        subdeptId: subdeptId || "-1",
    });

    // Fetch corporation name and logo
    let corporationName = "";
    let corporationLogo = "";
    try {
        const corpInfo = await getCorporationService({ ulbId: resolvedUlbId });
        corporationName = corpInfo.ABC_MUNICIPAL_TEXT || "";
        corporationLogo = corpInfo.ULBLOGO || "";
    } catch (_) {
        corporationName = "";
        corporationLogo = "";
    }

    // Enrich filters with display names
    reportResult.filters.deptName    = deptName    || null;
    reportResult.filters.bankName    = bankName    || null;
    reportResult.filters.subDeptName = subDeptName || null;

    // Get userId from JWT token — JWT payload has: { sub, name, orgId }
    const userId = req.user?.name || req.user?.sub || "";

    const pdf = await BankListReportPDFHelper({
        rows:            reportResult.data,
        filters:         reportResult.filters,
        salaryMonth:     reportResult.salaryMonth,
        corporationName,
        corporationLogo,
        userId,
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const pdfUrl  = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

    return res.json({
        success:  true,
        message:  "Bank List PDF Generated Successfully",
        fileName: pdf.fileName,
        pdfUrl,
    });
});

