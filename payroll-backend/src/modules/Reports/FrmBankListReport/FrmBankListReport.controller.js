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
        ulbid,
        ulbId,
        month,
        year,
        deptId,
        departmentId,
        deptName,
        bankName,
        subDeptName,
        bankId,
        subdeptId,
        subDepartmentId,
        billNo,
        employeeType
    } = req.body;

    const resolvedUlbId = Number(ulbid ?? ulbId);
    const resolvedDeptId = deptId ?? departmentId ?? "-1";
    const resolvedBankId = bankId ?? "-1";
    const resolvedSubdeptId = subdeptId ?? subDepartmentId ?? "-1";

    // Use the authenticated user's ID for Aopr_Userbill_Config.
    const reportUserId =
        req.user?.userId ??
        req.user?.userid ??
        req.user?.id ??
        req.user?.sub ??
        "";

    if ([930, 1750].includes(resolvedUlbId) && !reportUserId) {
        throw new AppError("User ID not found. Please login again.", 401);
    }

    const reportResult = await service.getBankListReportService({
        ulbid: resolvedUlbId,
        month,
        year,
        deptId: resolvedDeptId,
        bankId: resolvedBankId,
        subdeptId: resolvedSubdeptId,
        billNo: billNo ?? "-1",
        empType: employeeType ?? "NEW",
        userId: reportUserId
    });

    let corporationName = "";
    let corporationLogo = "";

    try {
        const corpInfo = await getCorporationService({
            ulbId: resolvedUlbId
        });

        corporationName = corpInfo?.ABC_MUNICIPAL_TEXT || "";
        corporationLogo = corpInfo?.ULBLOGO || "";
    } catch (error) {
        console.error("Corporation details fetch failed:", error);
    }

    reportResult.filters.deptName = deptName || null;
    reportResult.filters.bankName = bankName || null;
    reportResult.filters.subDeptName = subDeptName || null;
    reportResult.filters.billNo = billNo ?? "-1";
    reportResult.filters.employeeType = employeeType ?? "NEW";

    const pdf = await BankListReportPDFHelper({
        rows: reportResult.data,
        filters: reportResult.filters,
        salaryMonth: reportResult.salaryMonth,
        corporationName,
        corporationLogo,
        userId: reportUserId,
        cashCheque: reportResult.cashCheque,
        indianBankPayment: reportResult.indianBankPayment,
        axisBankPayment: reportResult.axisBankPayment,
        grandTotal: reportResult.totalPayable
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const pdfUrl = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

    return res.json({
        success: true,
        message: "Bank List PDF Generated Successfully",
        fileName: pdf.fileName,
        pdfUrl,
        summary: {
            totalEmployees: reportResult.count,
            cashCheque: reportResult.cashCheque,
            indianBankPayment: reportResult.indianBankPayment,
            axisBankPayment: reportResult.axisBankPayment,
            grandTotal: reportResult.totalPayable
        }
    });
});

exports.getBankListReportData = asyncHandler(async (req, res) => {
    const {
        ulbid,
        ulbId,
        month,
        year,
        deptId,
        departmentId,
        bankId,
        subdeptId,
        subDepartmentId,
        billNo,
        employeeType,
    } = req.body;

    const resolvedUlbId = Number(ulbid ?? ulbId);
    const resolvedDeptId = deptId ?? departmentId ?? "-1";
    const resolvedBankId = bankId ?? "-1";
    const resolvedSubdeptId = subdeptId ?? subDepartmentId ?? "-1";

    const reportUserId =
        req.user?.userId ??
        req.user?.userid ??
        req.user?.id ??
        req.user?.sub ??
        "";

    if (!resolvedUlbId || !month || !year) {
        throw new AppError("ULB, Month and Year are required.", 400);
    }

    if ([930, 1750].includes(resolvedUlbId) && !reportUserId) {
        throw new AppError("User ID not found. Please login again.", 401);
    }

    const reportResult = await service.getBankListReportService({
        ulbid: resolvedUlbId,
        month,
        year,
        deptId: resolvedDeptId,
        bankId: resolvedBankId,
        subdeptId: resolvedSubdeptId,
        billNo: billNo ?? "-1",
        empType: employeeType ?? "NEW",
        userId: reportUserId,
    });

    if (!reportResult.data?.length && !reportResult.rows?.length) {
        throw new AppError(
            "No records found for the selected filters.",
            404
        );
    }

    return res.status(200).json({
        success: true,
        message: "Bank list data fetched successfully.",
        data: {
            rows: reportResult.data ?? reportResult.rows,
            count: reportResult.count,
            filters: reportResult.filters,
            salaryMonth: reportResult.salaryMonth,
            cashCheque: reportResult.cashCheque,
            indianBankPayment: reportResult.indianBankPayment,
            axisBankPayment: reportResult.axisBankPayment,
            grandTotal: reportResult.totalPayable ?? reportResult.grandTotal,
        },
    });
});