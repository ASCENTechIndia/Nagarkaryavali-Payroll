const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmBankListReport.service");
const { BankListReportPDFHelper } = require("../../../utils/pdfHelper/FrmBankListReport");
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
    const { ulbid, ulbId, month, year, deptId, departmentId, bankId, subdeptId } = req.body;

    const resolvedUlbId = ulbid || ulbId;
    const resolvedDeptId = deptId || departmentId || "-1";

    const reportResult = await service.getBankListReportService({
        ulbid:    resolvedUlbId,
        month,
        year,
        deptId:   resolvedDeptId,
        bankId:   bankId || "-1",
        subdeptId: subdeptId || "-1",
    });

    const pdf = await BankListReportPDFHelper({
        rows:            reportResult.data,
        filters:         reportResult.filters,
        salaryMonth:     reportResult.salaryMonth,
        corporationName: "",
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
