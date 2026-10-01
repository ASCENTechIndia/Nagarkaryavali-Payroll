const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

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

Handlebars.registerHelper("isVibhag", function (reportType, options) {
    if (reportType === "VIBHAG") {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper("isEmployee", function (reportType, options) {
    if (reportType === "EMPLOYEE") {
        return options.fn(this);
    }
    return options.inverse(this);
});

async function generateESevaDashboardPDF(params) {
    let browser;

    try {
        const {
            reportType = "VIBHAG",
            data = [],
            ulbName = "",
            corporationLogo = "",
            userName = "",
            vibhagName = "",
            listType = "Total"
        } = params;

        const templatePath = path.resolve(__dirname, "../../templates/FrmESevaDashboard.html");

        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template not found: ${templatePath}`);
        }

        const templateHtml = fs.readFileSync(templatePath, "utf8");
        const template = Handlebars.compile(templateHtml);

        let totalEmp = 0, totalProceed = 0, totalPending = 0;
        if (reportType === "VIBHAG") {
            data.forEach(row => {
                totalEmp     += Number(row.TOTALEMP     || 0);
                totalProceed += Number(row.PROCCEDEMP   || 0);
                totalPending += Number(row.PENDINGEMP   || 0);
            });
        }

        const typeLabel =
            listType === "Proceed" ? "Proceed" :
            listType === "Pending" ? "Pending" : "Total";

        const templateData = {
            reportType,
            ulbName,
            corporationLogo,
            userName,
            vibhagName,
            listType: typeLabel,
            rows: data,
            totalEmp,
            totalProceed,
            totalPending,
            totalCount: data.length,
            generatedDate: new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            })
        };

        const html = template(templateData);

        const chromePath = path.resolve(
            __dirname,
            "../../../node_modules/puppeteer/.cache/puppeteer/chrome/win64-135.0.7049.84/chrome-win64/chrome.exe"
        );

        const launchOptions = {
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        };

        if (fs.existsSync(chromePath)) {
            launchOptions.executablePath = chromePath;
        }

        browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();

        await page.setViewport({ width: 1280, height: 900 });

        await page.setContent(html, {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            portrait: true,
            printBackground: true,
            margin: {
                top: "10mm",
                bottom: "10mm",
                left: "8mm",
                right: "8mm"
            },
            preferCSSPageSize: true
        });

        await browser.close();

        const outputDir = path.resolve(__dirname, "../../../public/pdf");
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const fileName = `ESeva_${reportType}_${Date.now()}.pdf`;
        const filePath = path.join(outputDir, fileName);

        fs.writeFileSync(filePath, pdfBuffer);

        return { fileName, filePath, pdfBuffer };

    } catch (error) {
        if (browser) {
            await browser.close();
        }
        console.error("E-Seva PDF Generation Error:", error);
        throw error;
    }
}

module.exports = {
    generateESevaDashboardPDF
};