const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmDeleteEmployeeReport.service");
const { DeleteEmployeeReportPDFHelper } = require("../../../utils/pdfHelper/FrmDeleteEmployeeReport");
const { getCorporationService } = require("../../MenuAccess/MenuAccess.service");
const path = require("path");

exports.getDepartmentList = asyncHandler(async (req, res) => {
    const { ulbid, ulbId } = req.body;
    const resolvedUlbId = ulbid ?? ulbId ?? req.user?.ulbId ?? req.user?.orgId;
    const data = await service.getDepartmentListService({ ulbid: resolvedUlbId });
    return ok(res, data, "Department list fetched successfully");
});

exports.getBillNoList = asyncHandler(async (req, res) => {
    const { ulbid, ulbId, deptId } = req.body;
    const resolvedUlbId = ulbid ?? ulbId ?? req.user?.ulbId ?? req.user?.orgId;
    const data = await service.getBillNoListService({
        ulbid: resolvedUlbId,
        deptId,
    });
    return ok(res, data, "Bill No list fetched successfully");
});

exports.getReportData = asyncHandler(async (req, res) => {
    const { ulbid, ulbId, deptId, billNo, empName, slipNo } = req.body;
    const resolvedUlbId = ulbid ?? ulbId ?? req.user?.ulbId ?? req.user?.orgId;
    const data = await service.getDeleteEmployeeReportService({
        ulbid: resolvedUlbId,
        deptId,
        billNo,
        empName,
        slipNo,
    });
    return ok(res, data, "Delete Employee Record fetched successfully");
});

exports.generatePdf = asyncHandler(async (req, res) => {
    const { ulbid, ulbId, deptId, deptName, billNo, empName, slipNo } = req.body;
    const resolvedUlbId = ulbid ?? ulbId ?? req.user?.ulbId ?? req.user?.orgId;

    const reportResult = await service.getDeleteEmployeeReportService({
        ulbid: resolvedUlbId,
        deptId: deptId || "-1",
        billNo: billNo || "-1",
        empName: empName || "",
        slipNo: slipNo || "",
    });

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

    reportResult.filters.deptName = deptName || null;

    const userId = req.user?.name || req.user?.sub || "";

    const pdf = await DeleteEmployeeReportPDFHelper({
        rows: reportResult.data,
        filters: reportResult.filters,
        corporationName,
        corporationLogo,
        userId,
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const pdfUrl = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

    return res.json({
        success: true,
        message: "Delete Employee Record PDF Generated Successfully",
        fileName: pdf.fileName,
        pdfUrl,
    });
});
