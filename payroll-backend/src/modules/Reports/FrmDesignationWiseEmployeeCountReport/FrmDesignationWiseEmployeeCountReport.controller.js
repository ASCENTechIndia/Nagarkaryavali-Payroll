const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmDesignationWiseEmployeeCountReport.service");
const { DesigwiseEmpCountPDFHelper } = require("../../../utils/pdfHelper/FrmDesigwiseEmpCount");
const { getCorporationService } = require("../../MenuAccess/MenuAccess.service");
const path = require("path");

exports.getDepartmentList = asyncHandler(async (req, res) => {
    const { ulbid, ulbId } = req.body;
    const resolvedUlbId = ulbid ?? ulbId ?? req.user?.ulbId ?? req.user?.orgId;
    const data = await service.getDepartmentListService({ ulbid: resolvedUlbId });
    return ok(res, data, "Department list fetched successfully");
});

exports.getReport = asyncHandler(async (req, res) => {
    const { ulbid, ulbId, month, year, deptId, empType } = req.body;
    const data = await service.getDesigwiseEmpCountService({
        ulbid:   ulbid || ulbId,
        month,
        year,
        deptId,
        empType,
    });
    return ok(res, data, "Designation wise employee count fetched successfully");
});

exports.generatePdf = asyncHandler(async (req, res) => {
    const { ulbid, ulbId, month, year, deptId, deptName, empType } = req.body;

    const resolvedUlbId = ulbid || ulbId;

    // Fetch report data
    const reportResult = await service.getDesigwiseEmpCountService({
        ulbid:   resolvedUlbId,
        month,
        year,
        deptId:  deptId || "-1",
        empType,
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
    reportResult.filters.deptName = deptName || null;

    // Get userId from JWT token
    const userId = req.user?.name || req.user?.sub || "";

    const pdf = await DesigwiseEmpCountPDFHelper({
        rows:            reportResult.data,
        filters:         reportResult.filters,
        salaryMonth:     reportResult.salaryMonth,
        salaryDate:      reportResult.salaryDate,
        corporationName,
        corporationLogo,
        userId,
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const pdfUrl  = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

    return res.json({
        success:  true,
        message:  "Designation Wise Employee Count PDF Generated Successfully",
        fileName: pdf.fileName,
        pdfUrl,
    });
});
