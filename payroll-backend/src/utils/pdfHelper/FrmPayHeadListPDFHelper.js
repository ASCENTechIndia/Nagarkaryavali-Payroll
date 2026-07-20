const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

Handlebars.registerHelper("formatNumber", function (value) {
    const num = Number(value || 0);
    return num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
});

Handlebars.registerHelper("formatAmount", function (value) {
    const num = Number(value || 0);
    return num.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
});

Handlebars.registerHelper("inc", function (value) {
    return Number(value) + 1;
});

Handlebars.registerHelper("eq", function (a, b) {
    return a === b;
});

Handlebars.registerHelper("multiply", function (a, b) {
    return (Number(a) || 0) * (Number(b) || 0);
});

Handlebars.registerHelper("ifNotEmpty", function (value, options) {
    if (value && value !== "" && value !== "-1") {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper("isKapatPayHead", function (payHeadId, options) {
    if (payHeadId == 287) {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper("isProfessionalTax", function (reportType, options) {
    if (reportType === "SUB_DETAIL_PROFESSIONAL_TAX") {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper("calculateTotals", function (items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
        return { totalAmount: 0, totalMale: 0, totalFemale: 0, totalCount: 0 };
    }
    let totalAmount = 0, totalMale = 0, totalFemale = 0, totalCount = 0;
    items.forEach(item => {
        totalAmount += (Number(item.amount || 0) * Number(item.total || 0));
        totalMale += Number(item.male || 0);
        totalFemale += Number(item.female || 0);
        totalCount += Number(item.total || 0);
    });
    return { totalAmount, totalMale, totalFemale, totalCount };
});

Handlebars.registerHelper("isShowPanColumn", function (showPanColumn, options) {
    if (showPanColumn) {
        return options.fn(this);
    }
    return options.inverse(this);
});

const imageToBase64 = (imgPath) => {
    if (!imgPath || !fs.existsSync(imgPath)) return "";
    const file = fs.readFileSync(imgPath);
    const ext = path.extname(imgPath).replace(".", "");
    return `data:image/${ext};base64,${file.toString("base64")}`;
};

async function generatePayHeadListPDF(params) {
    let browser;

    try {
        const {
            data = [],
            departmentGroups = [],
            showPanColumn = false,
            month = "",
            year = "",
            department = "",
            payHeadName = "",
            payHeadId = "",
            reportType = "MAIN_PAYHEAD_LIST",
            corporationName = "सांगली, मिरज आणि कुपवाड शहर महानगरपालिका",
            corporationLogo = "",
            totals = {},
            subDetail = null,
            subDetailTotalAmount = 0,
            subDetailTotalCount = 0
        } = params;

        const templatePath = path.resolve(__dirname, "../../templates/FrmPayHeadList.html");

        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template not found: ${templatePath}`);
        }

        const templateHtml = fs.readFileSync(templatePath, "utf8");
        const template = Handlebars.compile(templateHtml);

        const processedDepartmentGroups = departmentGroups.map(group => ({
            ...group,
            employees: group.employees.map(emp => ({
                ...emp,
                srNo: emp.srNo || 0,
                empId: emp.empId || "",
                employeeName: emp.employeeName || "",
                amount: emp.amount || 0,
                panNo: emp.panNo || "",
                headid: emp.headid || "",
                kapatno: emp.kapatno || ""
            }))
        }));

        let totalAmount = 0;
        if (totals && totals.totalAmount) {
            totalAmount = Number(totals.totalAmount);
        } else {
            totalAmount = data.reduce((sum, emp) => sum + (emp.amount || 0), 0);
        }

        let finalLogo = corporationLogo;

        const templateData = {
            corporationName: corporationName,
            corporationLogo: finalLogo,
            reportTitle: "मासिक हप्ते कपात अहवाल",
            payHeadName: payHeadName,
            monthYear: `${month} ${year}`,
            month: month,
            year: year,
            payHeadId: payHeadId,
            reportType: reportType,
            departmentName: department || "सर्व विभाग",
            departmentGroups: processedDepartmentGroups,
            showPanColumn: showPanColumn,
            totalAmount: totalAmount,
            subDetail: subDetail,
            subDetailTotalAmount: subDetailTotalAmount,
            subDetailTotalCount: subDetailTotalCount,
            generatedDate: new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }),
            hasData: data.length > 0,
            isProfessionalTax: reportType === "SUB_DETAIL_PROFESSIONAL_TAX",
            isKapatPayHead: payHeadId == 287
        };

        const html = template(templateData);

        const browserOptions = {
            headless: "new",
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-accelerated-2d-canvas",
                "--disable-accelerated-video-decode",
            ],
        };

        const possiblePaths = [
            "C:/Program Files/Google/Chrome/Application/chrome.exe",
            "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
            "/usr/bin/google-chrome",
            "/usr/bin/chromium-browser",
            "/usr/bin/chromium",
        ];

        for (const chromePath of possiblePaths) {
            if (fs.existsSync(chromePath)) {
                browserOptions.executablePath = chromePath;
                break;
            }
        }

        browser = await puppeteer.launch(browserOptions);
        const page = await browser.newPage();

        await page.setViewport({ width: 1280, height: 900 });

        await page.setContent(html, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            portrait: true,
            printBackground: true,
            margin: {
                top: "10mm",
                bottom: "10mm",
                left: "8mm",
                right: "8mm",
            },
            preferCSSPageSize: true,
        });

        await browser.close();

        const outputDir = path.resolve(__dirname, "../../../public/pdf");
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const fileName = `PayHeadList_${payHeadId}_${Date.now()}.pdf`;
        const filePath = path.join(outputDir, fileName);

        fs.writeFileSync(filePath, pdfBuffer);

        return {
            fileName,
            filePath,
            pdfBuffer
        };

    } catch (error) {
        if (browser) {
            await browser.close();
        }
        console.error("PDF Generation Error:", error);
        throw error;
    }
}

module.exports = {
    generatePayHeadListPDF
};