const repo = require("./FrmPayHeadList.repo");

function validateDateFormat(dateStr) {
    const dateRegex = /^\d{2}-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{4}$/i;
    return dateRegex.test(dateStr);
}

function getLastDateOfMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

function formatSalaryDate(month, year) {
    const lastDate = getLastDateOfMonth(parseInt(month), parseInt(year));
    const date = new Date(parseInt(year), parseInt(month) - 1, lastDate);
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const day = String(date.getDate()).padStart(2, '0');
    const monthAbbr = months[date.getMonth()];
    const yearNum = date.getFullYear();
    
    return `${day}-${monthAbbr}-${yearNum}`;
}

function validateRequiredParams(params, requiredFields) {
    const missing = [];
    for (const field of requiredFields) {
        if (!params[field] || params[field] === "" || params[field] === "-1") {
            missing.push(field);
        }
    }
    if (missing.length > 0) {
        throw new Error(`Missing required parameters: ${missing.join(", ")}`);
    }
    return true;
}

async function processPFFundService(payload) {
    const {
        ulbid, month, year, categoryId, zoneId, empStatus, deptId
    } = payload;

    validateRequiredParams(payload, ["ulbid", "month", "year", "categoryId", "zoneId"]);

    const salaryDate = formatSalaryDate(month, year);

    const data = await repo.getPFFundRepo({
        salaryDate,
        ulbid,
        categoryId,
        zoneId,
        empStatus: empStatus || "NEW",
        deptId: deptId === "-1" ? null : deptId
    });

    return {
        success: true,
        reportType: "PF_FUND",
        salaryDate,
        count: data.length,
        data
    };
}

async function processIncomeTaxService(payload) {
    const {
        ulbid, month, year, categoryId, zoneId, empStatus, deptId
    } = payload;

    validateRequiredParams(payload, ["ulbid", "month", "year", "categoryId", "zoneId"]);

    const salaryDate = formatSalaryDate(month, year);

    const data = await repo.getIncomeTaxRepo({
        salaryDate,
        ulbid,
        categoryId,
        zoneId,
        empStatus: empStatus || "NEW",
        deptId: deptId === "-1" ? null : deptId
    });

    return {
        success: true,
        reportType: "INCOME_TAX",
        salaryDate,
        count: data.length,
        data
    };
}

async function processLICService(payload) {
    const {
        ulbid, month, year, categoryId, zoneId, empStatus, deptId
    } = payload;

    validateRequiredParams(payload, ["ulbid", "month", "year", "categoryId", "zoneId"]);

    const salaryDate = formatSalaryDate(month, year);

    const data = await repo.getLICRepo({
        salaryDate,
        ulbid,
        categoryId,
        zoneId,
        empStatus: empStatus || "NEW",
        deptId: deptId === "-1" ? null : deptId
    });

    return {
        success: true,
        reportType: "LIC",
        salaryDate,
        count: data.length,
        data
    };
}

async function processProfessionalTaxSlabService(payload) {
    const {
        ulbid, month, year, categoryId, zoneId, empStatus, deptId
    } = payload;

    validateRequiredParams(payload, ["ulbid", "month", "year", "categoryId", "zoneId"]);

    const salaryDate = formatSalaryDate(month, year);

    const data = await repo.getProfessionalTaxSlabRepo({
        salaryDate,
        ulbid,
        categoryId,
        zoneId,
        empStatus: empStatus || "NEW",
        deptId: deptId === "-1" ? null : deptId
    });

    return {
        success: true,
        reportType: "PROFESSIONAL_TAX_SLAB",
        salaryDate,
        count: data.length,
        data
    };
}

async function processMainPayHeadListService(payload) {
    const {
        ulbid, month, year, categoryId, zoneId, payHeadId, 
        empStatus, deptId, subDeptId, hsgRentType, bankRecType, festAdvType,
        useShortName = false
    } = payload;

    validateRequiredParams(payload, ["ulbid", "month", "year", "categoryId", "zoneId", "payHeadId"]);

    const salaryDate = formatSalaryDate(month, year);

    const data = await repo.getMainPayHeadListRepo({
        salaryDate,
        ulbid,
        categoryId,
        zoneId,
        payHeadId,
        // empStatus: empStatus || "NEW",
        empStatus: (empStatus && empStatus !== "-1") ? empStatus : undefined,
        deptId: deptId === "-1" ? null : deptId,
        subDeptId: subDeptId === "-1" ? null : subDeptId,
        hsgRentType: hsgRentType === "-1" ? null : hsgRentType,
        bankRecType: bankRecType === "-1" ? null : bankRecType,
        festAdvType: festAdvType === "-1" ? null : festAdvType,
        useShortName: useShortName 
    });

    return {
        success: true,
        reportType: "MAIN_PAYHEAD_LIST",
        salaryDate,
        count: data.length,
        data
    };
}

async function processAMCProfessionalTaxService(payload) {
    const {
        ulbid, month, year, categoryId, zoneId, payHeadId, deptId, subDeptId
    } = payload;

    validateRequiredParams(payload, ["ulbid", "month", "year", "categoryId", "zoneId"]);

    const salaryDate = formatSalaryDate(month, year);

    const data = await repo.getAMCProfessionalTaxRepo({
        salaryDate,
        ulbid,
        categoryId,
        zoneId,
        payHeadId: payHeadId || "40",
        deptId: deptId === "-1" ? null : deptId,
        subDeptId: subDeptId === "-1" ? null : subDeptId
    });

    return {
        success: true,
        reportType: "AMC_PROFESSIONAL_TAX",
        salaryDate,
        count: data.length,
        data
    };
}

async function processAMCTenFourteenService(payload) {
    const {
        ulbid, month, year, categoryId, zoneId, deptId, subDeptId
    } = payload;

    validateRequiredParams(payload, ["ulbid", "month", "year", "categoryId", "zoneId"]);

    const salaryDate = formatSalaryDate(month, year);

    const data = await repo.getAMCTenFourteenRepo({
        salaryDate,
        ulbid,
        categoryId,
        zoneId,
        deptId: deptId === "-1" ? null : deptId,
        subDeptId: subDeptId === "-1" ? null : subDeptId
    });

    return {
        success: true,
        reportType: "AMC_TEN_FOURTEEN",
        salaryDate,
        data: {
            leftSide: data.filter(row => row.SIDE === "L"),
            rightSide: data.filter(row => row.SIDE === "R"),
            allData: data
        }
    };
}

async function processExcelGrossTDSService(payload) {
    const {
        ulbid, month, year, categoryId, zoneId, payHeadId,
        empStatus, deptId, hsgRentType, bankRecType, festAdvType
    } = payload;

    validateRequiredParams(payload, ["ulbid", "month", "year", "categoryId", "zoneId", "payHeadId"]);

    const salaryDate = formatSalaryDate(month, year);

    const data = await repo.getExcelGrossTDSRepo({
        salaryDate,
        ulbid,
        categoryId,
        zoneId,
        payHeadId,
        empStatus: empStatus || "NEW",
        deptId: deptId === "-1" ? null : deptId,
        hsgRentType: hsgRentType === "-1" ? null : hsgRentType,
        bankRecType: bankRecType === "-1" ? null : bankRecType,
        festAdvType: festAdvType === "-1" ? null : festAdvType
    });

    return {
        success: true,
        reportType: "EXCEL_GROSS_TDS",
        salaryDate,
        count: data.length,
        data
    };
}

async function processSubDetailProfessionalTaxService(payload) {
    const {
        ulbid, month, year, categoryId, zoneId, payHeadId, deptId
    } = payload;

    validateRequiredParams(payload, ["ulbid", "month", "year", "categoryId", "zoneId"]);

    const salaryDate = formatSalaryDate(month, year);

    const employeeData = await repo.getMainPayHeadListRepo({
        salaryDate,
        ulbid,
        categoryId,
        zoneId,
        payHeadId: 358,
        deptId: deptId === "-1" ? null : deptId,
        subDeptId: null,
        // empStatus: null,
        empStatus: undefined,
        useShortName: true
    });

    const subDetailData = await repo.getSubDetailProfessionalTaxRepo({
        salaryDate,
        ulbid,
        categoryId,
        zoneId,
        deptId: deptId === "-1" ? null : deptId
    });

    return {
        success: true,
        reportType: "SUB_DETAIL_PROFESSIONAL_TAX",
        salaryDate,
        data: {
            employees: employeeData,      // For first table
            withHyphen: subDetailData.withHyphen,
            withoutHyphen: subDetailData.withoutHyphen
        }
    };
}

async function processReportService(payload) {
    const { ulbid, payHeadId } = payload;

    if (ulbid == 870 && payHeadId == "282") {
        const { empStatus, ...restPayload } = payload;
        return await processMainPayHeadListService({
            ...restPayload,
            useShortName: true,
            empStatus: undefined
        });
    }
    
    if (ulbid == 870 && payHeadId == "358") {
        const { empStatus, ...restPayload } = payload;
        return await processSubDetailProfessionalTaxService({
            ...restPayload,
            empStatus: undefined
        });
    }
    
    if (ulbid == 870) {
        const { empStatus, ...restPayload } = payload;
        return await processMainPayHeadListService({
            ...restPayload,
            useShortName: true,
            empStatus: undefined 
        });
    }
    

    if ((ulbid == 770 || ulbid == 1750 || ulbid == 930) && 
        (payHeadId == "424" || payHeadId == "479" || payHeadId == "426")) {
        return await processPFFundService(payload);
    }
    
    if ((ulbid == 770 || ulbid == 1750 || ulbid == 930) && payHeadId == "470") {
        return await processIncomeTaxService(payload);
    }
    
    if ((ulbid == 770 || ulbid == 1750 || ulbid == 930 || ulbid == 4 || ulbid == 1670 || ulbid == 1630) && 
        (payHeadId == "434" || payHeadId == "341" || payHeadId == "701")) {
        return await processLICService(payload);
    }
    
    if ((ulbid == 770 || ulbid == 1750 || ulbid == 930) && payHeadId == "453") {
        return await processProfessionalTaxSlabService(payload);
    }
    
    if (ulbid == 2 && payHeadId == "40") {
        return await processAMCProfessionalTaxService(payload);
    }
    
    if (ulbid == 2 && payHeadId == "99999") {
        return await processAMCTenFourteenService(payload);
    }
    
    if ((ulbid == 751 || ulbid == 870) && payHeadId == "358") {
        return await processSubDetailProfessionalTaxService(payload);
    }
    
    return await processMainPayHeadListService(payload);
}

module.exports = {
    processReportService,
    processPFFundService,
    processIncomeTaxService,
    processLICService,
    processProfessionalTaxSlabService,
    processMainPayHeadListService,
    processAMCProfessionalTaxService,
    processAMCTenFourteenService,
    processExcelGrossTDSService,
    processSubDetailProfessionalTaxService,
    formatSalaryDate,
    validateDateFormat
};