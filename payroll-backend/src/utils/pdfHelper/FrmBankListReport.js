const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

const BankListReportPDFHelper = async ({ rows, filters, salaryMonth, corporationName, corporationLogo, userId }) => {
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

    const now = new Date();
    const printDate = now.toLocaleDateString("en-GB");  // DD/MM/YYYY
    const printTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

    const html = template({
        corporationName: corporationName || "",
        corporationLogo: corporationLogo || "",
        salaryMonth,
        department: filters.deptName  || (Number(filters.deptId) === -1  ? "All" : filters.deptId),
        bank:       filters.bankName  || (Number(filters.bankId) === -1  ? "All" : filters.bankId),
        subDept:    filters.subDeptName || "",
        printDate,
        printTime,
        userId:     userId || "",
        rows:       reportRows,
        grandTotal: grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    });

    // Use puppeteer's built-in executable path resolver
    let chromePath = null;
    try {
        const puppeteer = require("puppeteer");
        chromePath = puppeteer.executablePath();
        if (!fs.existsSync(chromePath)) chromePath = null;
    } catch (_) {
        chromePath = null;
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
        landscape: false,
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
