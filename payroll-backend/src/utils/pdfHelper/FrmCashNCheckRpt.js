const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

const formatTime = (date) =>
    date
        .toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        })
        .replace(/\s+([AP]M)/i, (_, m) => m.toUpperCase());

const formatAmount = (val) =>
    Number(val || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

async function renderHtmlToPdf({ html, prefix, landscape = false }) {
    const chromePath = path.resolve(
        __dirname,
        "../../../node_modules/puppeteer/.cache/puppeteer/chrome/win64-135.0.7049.84/chrome-win64/chrome.exe"
    );

    const launchOptions = {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };

    if (fs.existsSync(chromePath)) {
        launchOptions.executablePath = chromePath;
        console.log("Using Chrome:", chromePath);
    } else {
        console.log("Chrome path not found, using Puppeteer's default executable.");
    }

    let browser;
    try {
        browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const images = Array.from(document.images);
            await Promise.all(
                images.map((img) => {
                    if (img.complete) return Promise.resolve();
                    return new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                })
            );
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            landscape,
            printBackground: true,
            preferCSSPageSize: true,
            margin: { top: "8mm", right: "8mm", bottom: "8mm", left: "8mm" },
        });

        const outputDir = path.resolve(__dirname, "../../../public/pdf");
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const fileName = `${prefix}_${Date.now()}.pdf`;
        const filePath = path.join(outputDir, fileName);
        fs.writeFileSync(filePath, pdfBuffer);

        return { fileName, filePath };
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (err) {
                console.error("Failed to close Puppeteer browser:", err);
            }
        }
    }
}

const CashReportPDFHelper = async ({
    rows,
    salaryMonth,
    department,
    paymode,
    corporationName,
    corporationLogo,
    userId,
}) => {
    const templatePath = path.resolve(__dirname, "../../templates/FrmCashNCheckCash.html");
    const template = Handlebars.compile(fs.readFileSync(templatePath, "utf8"));

    let totalPayable = 0;
    const reportRows = rows.map((row, index) => {
        const payable = Number(row.PAYABLEAMT || 0);
        totalPayable += payable;

        return {
            SRNO: index + 1,
            BILLNO: row.BILLNO || "",
            SLIPNO: row.SLIPNO || "",
            EMPNAME: row.EMPNAME || "",
            AXISACCNO: row.AXISACCNO || "-",
            INDACCNO: row.INDACCNO || "-",
            PAYABLEAMT: formatAmount(payable),
        };
    });

    const now = new Date();
    const html = template({
        corporationName: corporationName || "",
        corporationLogo: corporationLogo || "",
        salaryMonth,
        department: department || "All",
        paymode: paymode || "All",
        printDate: now.toLocaleDateString("en-GB"),
        printTime: formatTime(now),
        userId: userId || "",
        rows: reportRows,
        totalPayable: formatAmount(totalPayable),
    });

    return renderHtmlToPdf({ html, prefix: "Cash_and_Check", landscape: false });
};

const DcpsReportPDFHelper = async ({
    rows,
    salaryMonth,
    corporationName,
    corporationLogo,
    userId,
}) => {
    const templatePath = path.resolve(__dirname, "../../templates/FrmCashNCheckDcps.html");
    const template = Handlebars.compile(fs.readFileSync(templatePath, "utf8"));

    const totals = {
        basic: 0,
        gp: 0,
        da: 0,
        daDiff: 0,
        eDcps14: 0,
        eDcps14Diff: 0,
        dDcps10: 0,
        dDcps14: 0,
        dDcps10Diff: 0,
        dDcps14Diff: 0,
        total: 0,
    };

    const reportRows = rows.map((row, index) => {
        const basic = Number(row.E_BASIC || 0);
        const gp = Number(row.E_GP || 0);
        const da = Number(row.E_DA || 0);
        const daDiff = Number(row.E_DADIFF || 0);
        const eDcps14 = Number(row.E_DCPS14 || 0);
        const eDcps14Diff = Number(row.E_DCPSDIFF14 || 0);
        const dDcps10 = Number(row.D_DCPS10 || 0);
        const dDcps14 = Number(row.D_DCPS14 || 0);
        const dDcps10Diff = Number(row.D_DCPSDIFF10 || 0);
        const dDcps14Diff = Number(row.D_DCPSDIFF14 || 0);
        const total = Number(row.TOTAL || 0);

        totals.basic += basic;
        totals.gp += gp;
        totals.da += da;
        totals.daDiff += daDiff;
        totals.eDcps14 += eDcps14;
        totals.eDcps14Diff += eDcps14Diff;
        totals.dDcps10 += dDcps10;
        totals.dDcps14 += dDcps14;
        totals.dDcps10Diff += dDcps10Diff;
        totals.dDcps14Diff += dDcps14Diff;
        totals.total += total;

        return {
            SRNO: index + 1,
            BILLNO: row.BILLNO || "",
            SLIPNO: row.SLIPNO || "",
            EMPNAME: row.EMPNAME || "",
            E_BASIC: basic,
            E_GP: gp,
            E_DA: da,
            E_DADIFF: daDiff,
            E_DCPS14: eDcps14,
            E_DCPSDIFF14: eDcps14Diff,
            D_DCPS10: dDcps10,
            D_DCPS14: dDcps14,
            D_DCPSDIFF10: dDcps10Diff,
            D_DCPSDIFF14: dDcps14Diff,
            TOTAL: total,
        };
    });

    const now = new Date();
    const html = template({
        corporationName: corporationName || "",
        corporationLogo: corporationLogo || "",
        salaryMonth,
        printDate: now.toLocaleDateString("en-GB"),
        printTime: formatTime(now),
        userId: userId || "",
        rows: reportRows,
        totals,
    });

    return renderHtmlToPdf({ html, prefix: "DCPS_Addition_Deduction", landscape: true });
};

module.exports = {
    CashReportPDFHelper,
    DcpsReportPDFHelper,
};
