const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

const BankListReportPDFHelper = async ({ rows, filters, salaryMonth, corporationName }) => {
    const templatePath = path.resolve(
        __dirname,
        "../../templates/FrmBankListReport.html"
    );

    const htmlFile = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(htmlFile);

    let grandTotal = 0;

    const reportRows = rows.map((row, index) => {
        const payable = Number(row.PAYABLEAMT || 0);
        grandTotal += payable;
        return {
            SRNO:       index + 1,
            EMPID:      row.EMPID   || row.EMPCODE || "",
            EMPNAME:    row.EMPNAME || "",
            DEPTNAME:   row.DEPTNAME || "",
            BANKNAME:   row.BANKNAME || "",
            ACCNO:      row.ACCNO   || row.INDACCNO || row.AXISACCNO || "",
            PAYABLEAMT: payable.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        };
    });

    const html = template({
        corporationName: corporationName || "",
        salaryMonth,
        department: filters.deptId === "-1" ? "All" : filters.deptId,
        bank:       filters.bankId === "-1" ? "All" : filters.bankId,
        printDate:  new Date().toLocaleDateString("en-GB"),
        rows:       reportRows,
        grandTotal: grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    });

    // Detect the installed Chrome version dynamically
    const puppeteerCacheDir = path.resolve(
        __dirname,
        "../../../node_modules/puppeteer/.cache/puppeteer/chrome"
    );

    let chromePath = null;

    if (fs.existsSync(puppeteerCacheDir)) {
        const versions = fs.readdirSync(puppeteerCacheDir);
        if (versions.length > 0) {
            // Pick the first available version folder
            const chromeExe = path.join(
                puppeteerCacheDir,
                versions[0],
                "chrome-win64",
                "chrome.exe"
            );
            if (fs.existsSync(chromeExe)) {
                chromePath = chromeExe;
            }
        }
    }

    const launchOptions = {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };

    if (chromePath) {
        launchOptions.executablePath = chromePath;
    }

    const browser = await puppeteer.launch(launchOptions);
    const page    = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0", timeout: 0 });

    const pdfBuffer = await page.pdf({
        format: "A4",
        landscape: true,
        printBackground: true,
    });

    await browser.close();

    const outputDir = path.resolve(__dirname, "../../../public/pdf");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `BankList_${Date.now()}.pdf`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    return { fileName, filePath };
};

module.exports = { BankListReportPDFHelper };
