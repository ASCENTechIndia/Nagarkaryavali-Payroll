const asyncHandler = require("../../../libs/asyncHandler");
const { ok, error } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const service = require("./FrmPayHeadList.service");
const { getCorporationService } = require("../../MenuAccess/MenuAccess.service");
const { generatePayHeadListPDF } = require("../../../utils/pdfHelper/FrmPayHeadListPDFHelper");
const path = require("path");

exports.processReport = asyncHandler(async (req, res) => {
    const {
        ulbid,
        month,
        year,
        categoryId,
        zoneId,
        payHeadId,
        empStatus,
        deptId,
        subDeptId,
        hsgRentType,
        bankRecType,
        festAdvType,
        fileFormat = "PDF"
    } = req.body;

    if (!ulbid) {
        throw new AppError("ulbid is required", 400);
    }
    if (!month) {
        throw new AppError("month is required", 400);
    }
    if (!year) {
        throw new AppError("year is required", 400);
    }
    if (!categoryId) {
        throw new AppError("categoryId is required", 400);
    }
    if (!zoneId) {
        throw new AppError("zoneId is required", 400);
    }

    const monthNum = parseInt(month);
    if (monthNum < 1 || monthNum > 12) {
        throw new AppError("month must be between 1 and 12", 400);
    }

    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    if (yearNum < currentYear - 10 || yearNum > currentYear + 1) {
        throw new AppError(`year must be between ${currentYear - 10} and ${currentYear + 1}`, 400);
    }

    if (ulbid != 2 && (!payHeadId || payHeadId === "0")) {
        throw new AppError("payHeadId is required", 400);
    }

    if (ulbid == 2 && (!payHeadId || payHeadId === "0")) {
        throw new AppError("payHeadId is required for AMC reports", 400);
    }

    if ((ulbid == 770 || ulbid == 1750 || ulbid == 930) && (!empStatus || empStatus === "-1")) {
        throw new AppError("empStatus is required for this ULB", 400);
    }

    const result = await service.processReportService({
        ulbid: parseInt(ulbid),
        month,
        year,
        categoryId,
        zoneId,
        payHeadId,
        empStatus: empStatus || "NEW",
        deptId: deptId || "-1",
        subDeptId: subDeptId || "-1",
        hsgRentType: hsgRentType || "-1",
        bankRecType: bankRecType || "-1",
        festAdvType: festAdvType || "-1",
        fileFormat
    });

    return ok(res, result, "Report data fetched successfully");
});

exports.getPFFundReport = asyncHandler(async (req, res) => {
    const { ulbid, month, year, categoryId, zoneId, empStatus, deptId } = req.body;

    if (!ulbid || !month || !year || !categoryId || !zoneId) {
        throw new AppError("ulbid, month, year, categoryId, zoneId are required", 400);
    }

    if (![770, 1750, 930].includes(parseInt(ulbid))) {
        throw new AppError("PF Fund report is only available for ULB 770, 1750, 930", 400);
    }

    const result = await service.processPFFundService({
        ulbid: parseInt(ulbid),
        month,
        year,
        categoryId,
        zoneId,
        empStatus: empStatus || "NEW",
        deptId: deptId || "-1"
    });

    return ok(res, result, "PF Fund report fetched successfully");
});

exports.getIncomeTaxReport = asyncHandler(async (req, res) => {
    const { ulbid, month, year, categoryId, zoneId, empStatus, deptId } = req.body;

    if (!ulbid || !month || !year || !categoryId || !zoneId) {
        throw new AppError("ulbid, month, year, categoryId, zoneId are required", 400);
    }

    if (![770, 1750, 930].includes(parseInt(ulbid))) {
        throw new AppError("Income Tax report is only available for ULB 770, 1750, 930", 400);
    }

    const result = await service.processIncomeTaxService({
        ulbid: parseInt(ulbid),
        month,
        year,
        categoryId,
        zoneId,
        empStatus: empStatus || "NEW",
        deptId: deptId || "-1"
    });

    return ok(res, result, "Income Tax report fetched successfully");
});

exports.getLICReport = asyncHandler(async (req, res) => {
    const { ulbid, month, year, categoryId, zoneId, empStatus, deptId } = req.body;

    if (!ulbid || !month || !year || !categoryId || !zoneId) {
        throw new AppError("ulbid, month, year, categoryId, zoneId are required", 400);
    }

    const result = await service.processLICService({
        ulbid: parseInt(ulbid),
        month,
        year,
        categoryId,
        zoneId,
        empStatus: empStatus || "NEW",
        deptId: deptId || "-1"
    });

    return ok(res, result, "LIC report fetched successfully");
});

exports.getExcelGrossTDSReport = asyncHandler(async (req, res) => {
    const {
        ulbid, month, year, categoryId, zoneId, payHeadId,
        empStatus, deptId, hsgRentType, bankRecType, festAdvType
    } = req.body;

    if (!ulbid || !month || !year || !categoryId || !zoneId || !payHeadId) {
        throw new AppError("ulbid, month, year, categoryId, zoneId, payHeadId are required", 400);
    }

    const result = await service.processExcelGrossTDSService({
        ulbid: parseInt(ulbid),
        month,
        year,
        categoryId,
        zoneId,
        payHeadId,
        empStatus: empStatus || "NEW",
        deptId: deptId || "-1",
        hsgRentType: hsgRentType || "-1",
        bankRecType: bankRecType || "-1",
        festAdvType: festAdvType || "-1"
    });

    return ok(res, result, "Excel Gross TDS data fetched successfully");
});

exports.generatePayHeadListPDF = asyncHandler(async (req, res) => {
    const {
        ulbid,
        month,
        year,
        categoryId,
        zoneId,
        payHeadId,
        deptId,
        departmentName: frontendDepartmentName,
        payHeadName: frontendPayHeadName
    } = req.body;

    if (!ulbid) throw new AppError("ulbid is required", 400);
    if (!month) throw new AppError("month is required", 400);
    if (!year) throw new AppError("year is required", 400);
    if (!categoryId) throw new AppError("categoryId is required", 400);
    if (!zoneId) throw new AppError("zoneId is required", 400);
    if (!payHeadId) throw new AppError("payHeadId is required", 400);

    const result = await service.processReportService({
        ulbid: parseInt(ulbid),
        month,
        year,
        categoryId,
        zoneId,
        payHeadId,
        deptId: deptId
    });

    if (!result.success) {
        throw new AppError(result.message || "Failed to fetch data", 500);
    }

    const corpInfo = await getCorporationService({ ulbId: ulbid });

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const monthName = monthNames[parseInt(month) - 1] || month;

    let hasData = false;
    let processedData = [];
    let totalAmount = 0;
    let subDetail = null;

    let departmentName = frontendDepartmentName || "सर्व विभाग";
    let payHeadName = frontendPayHeadName || "विविध कपात";

    let subDetailTotalAmount = 0;
    let subDetailTotalCount = 0;

    if (result.reportType === "SUB_DETAIL_PROFESSIONAL_TAX") {
        const employees = result.data?.employees || [];
        const withHyphen = result.data?.withHyphen || [];
        const withoutHyphen = result.data?.withoutHyphen || [];

        hasData = employees.length > 0 || withHyphen.length > 0 || withoutHyphen.length > 0;

        processedData = employees.map((item, index) => ({
            ...item,
            srNo: index + 1,
            empId: String(item.EMPID || item.empid || "").padStart(5, "0"),
            amount: Number(item.AMOUNT || item.Amount || 0),
            employeeName: item.MARNAME || item.marname || item.ENGNAME || item.engname || "",
            deptName: item.DEPTNAME || item.deptname || departmentName,
            panNo: item.PANNO || item.panno || "",
            headid: item.HEADID || item.headid || "",
            gender: item.GENDER || ""
        }));

        totalAmount = processedData.reduce((sum, emp) => sum + emp.amount, 0);

        subDetail = {
            withHyphen: withHyphen.map(item => ({
                amount: Number(item.AMOUNT || item.Amount || item.TAX_AMOUNT || 0),
                male: Number(item.MALE || item.MALE_COUNT || 0),
                female: Number(item.FEMALE || item.FEMALE_COUNT || 0),
                total: Number(item.TOTAL || item.TOTAL_COUNT || 0)
            })),
            withoutHyphen: withoutHyphen.map(item => ({
                amount: Number(item.AMOUNT || item.Amount || item.TAX_AMOUNT || 0),
                male: Number(item.MALE || item.MALE_COUNT || 0),
                female: Number(item.FEMALE || item.FEMALE_COUNT || 0),
                total: Number(item.TOTAL || item.TOTAL_COUNT || 0)
            }))
        };

        if (!frontendDepartmentName && employees.length > 0) {
            departmentName = employees[0].DEPTNAME || employees[0].deptname || "सर्व विभाग";
        }
        if (!frontendPayHeadName && employees.length > 0) {
            payHeadName = employees[0].PAYHEAD_NAME || employees[0].payhead_name || "व्यवसाय कर";
        }

        const withoutHyphenData = subDetail.withoutHyphen || [];
        withoutHyphenData.forEach(item => {
            subDetailTotalAmount += item.amount * item.total;
            subDetailTotalCount += item.total;
        });

    } else {
        processedData = (result.data || []).map((item, index) => ({
            ...item,
            srNo: index + 1,
            empId: String(item.EMPID || item.empid || "").padStart(5, "0"),
            amount: Number(item.AMOUNT || item.Amount || 0),
            employeeName: item.MARNAME || item.marname || item.ENGNAME || item.engname || "",
            deptName: item.DEPTNAME || item.deptname || departmentName,
            panNo: item.PANNO || item.panno || "",
            headid: item.HEADID || item.headid || "",
            kapatno: item.KAPATNO || item.kapatno || ""
        }));

        totalAmount = processedData.reduce((sum, emp) => sum + emp.amount, 0);
        hasData = result.data && result.data.length > 0;

        if (!frontendDepartmentName && result.data && result.data.length > 0) {
            departmentName = result.data[0].DEPTNAME || result.data[0].deptname || "सर्व विभाग";
        }
        if (!frontendPayHeadName && result.data && result.data.length > 0) {
            payHeadName = result.data[0].PAYHEAD_NAME ||
                         result.data[0].ename ||
                         result.data[0].payhead_name ||
                         "विविध कपात";
        }
    }

    console.log("controller result :", result)

    if (!hasData) {
        return res.json({
            success: result.success,
            message: "No records found.",
            count: result.count,
            data: result.data,
            reportType: result.reportType
        });
    }

    const deptMap = new Map();

    processedData.forEach(item => {
        const deptName = item.deptName || "इतर";
        if (!deptMap.has(deptName)) {
            deptMap.set(deptName, {
                deptName: deptName,
                employees: [],
                deptTotal: 0
            });
        }
        const group = deptMap.get(deptName);
        group.employees.push(item);
        group.deptTotal += item.amount;
    });

    const departmentGroups = [];
    let overallSerialNo = 0;

    deptMap.forEach((group) => {
        group.employees.forEach((emp, idx) => {
            emp.srNo = idx + 1;
            overallSerialNo++;
        });
        departmentGroups.push(group);
    });

    const showPanColumn = (payHeadId == "282" || payHeadId == "358");

    const pdfResult = await generatePayHeadListPDF({
        data: processedData,
        departmentGroups: departmentGroups,
        showPanColumn: showPanColumn,
        month: monthName,
        year: year,
        department: departmentName,
        payHeadName: payHeadName,
        payHeadId: payHeadId,
        reportType: result.reportType,
        corporationName: corpInfo?.ABC_MUNICIPAL_TEXT || "सांगली, मिरज आणि कुपवाड शहर महानगरपालिका",
        corporationLogo: corpInfo?.ULBLOGO || "",
        totals: {
            totalAmount: totalAmount
        },
        subDetail: subDetail,
        subDetailTotalAmount: subDetailTotalAmount,
        subDetailTotalCount: subDetailTotalCount
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const pdfUrl = `${baseUrl}/pdf/${path.basename(pdfResult.filePath)}`;

    return res.json({
        success: true,
        message: "PDF Generated Successfully",
        fileName: pdfResult.fileName,
        pdfUrl: pdfUrl,
        recordCount: processedData.length,
        totalAmount: totalAmount,
        reportType: result.reportType,
        payHeadId: payHeadId,
        departmentCount: departmentGroups.length
    });
});