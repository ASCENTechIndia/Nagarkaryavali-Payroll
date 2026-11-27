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

        // Payment summary
        cashCheque: reportResult.cashCheque,
        indianBankPayment: reportResult.indianBankPayment,
        axisBankPayment: reportResult.axisBankPayment,
        grandTotal: reportResult.totalPayable
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const pdfUrl = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

    return res.status(200).json({
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
        throw new AppError(
            "ULB, Month and Year are required.",
            400
        );
    }

    if ([930, 1750].includes(resolvedUlbId) && !reportUserId) {
        throw new AppError(
            "User ID not found. Please login again.",
            401
        );
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

    const rows = reportResult.data ?? reportResult.rows ?? [];

    if (!rows.length) {
        throw new AppError(
            "No records found for the selected filters.",
            404
        );
    }

    const cashCheque =
        Number(reportResult.cashCheque) || 0;

    const indianBankPayment =
        Number(reportResult.indianBankPayment) || 0;

    const axisBankPayment =
        Number(reportResult.axisBankPayment) || 0;

    const grandTotal =
        Number(
            reportResult.totalPayable ??
            reportResult.grandTotal
        ) || 0;

    return res.status(200).json({
        success: true,
        message: "Bank list Excel data fetched successfully.",

        data: {
            rows,
            count: reportResult.count ?? rows.length,

            filters: reportResult.filters ?? {},

            salaryMonth: reportResult.salaryMonth ?? "",

            cashCheque,
            indianBankPayment,
            axisBankPayment,
            grandTotal,

            paymentSummary: {
                cashCheque,
                indianBankPayment,
                axisBankPayment,
                grandTotal,
            },
        },
    });
});



exports.generateBankListReportPDF = asyncHandler(async (req, res) => {
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
        throw new AppError(
            "ULB, Month and Year are required.",
            400
        );
    }

    if ([930, 1750].includes(resolvedUlbId) && !reportUserId) {
        throw new AppError(
            "User ID not found. Please login again.",
            401
        );
    }

    // Fetch report data
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

    const rows = reportResult.data ?? reportResult.rows ?? [];

    if (!rows.length) {
        throw new AppError(
            "No records found for the selected filters.",
            404
        );
    }

    // Payment summary
    const cashCheque =
        Number(reportResult.cashCheque) || 0;

    const indianBankPayment =
        Number(reportResult.indianBankPayment) || 0;

    const axisBankPayment =
        Number(reportResult.axisBankPayment) || 0;

    const grandTotal =
        Number(
            reportResult.totalPayable ??
            reportResult.grandTotal
        ) || 0;

    // Generate PDF
    const pdfResult = await BankListReportPDFHelper({
        rows,
        filters: reportResult.filters ?? {},
        salaryMonth: reportResult.salaryMonth ?? "",

        corporationName: req.user?.corporationName ?? "",
        corporationLogo: req.user?.corporationLogo ?? "",

        userId: reportUserId,

        cashCheque,
        indianBankPayment,
        axisBankPayment,
        grandTotal,
    });

    return res.status(200).json({
        success: true,
        message: "Bank List PDF generated successfully.",

        data: {
            fileName: pdfResult.fileName,
            pdfUrl: `/pdf/${pdfResult.fileName}`,

            count: rows.length,

            paymentSummary: {
                cashCheque,
                indianBankPayment,
                axisBankPayment,
                grandTotal,
            },
        },
    });
});
