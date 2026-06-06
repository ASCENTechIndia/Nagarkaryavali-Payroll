const asyncHandler = require("../../../libs/asyncHandler");
const { ok, error } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const service = require("./FrmPayHeadList.service");


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
