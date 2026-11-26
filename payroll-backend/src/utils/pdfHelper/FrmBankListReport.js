
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

const formatAmount = (value) =>
    (Number(value) || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const getField = (row, key) =>
    row[key] ?? row[key.toLowerCase()] ?? "";

const BankListReportPDFHelper = async ({
    rows,
    filters,
    salaryMonth,
    corporationName,
    corporationLogo,
    userId,
    cashCheque,
    indianBankPayment,
    axisBankPayment,
    grandTotal
}) => {
    const templatePath = path.resolve(
        __dirname,
        "../../templates/FrmBankListReport.html"
    );

    const htmlFile = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(htmlFile);

    // Map all repository fields
    const reportRows = rows.map((row, index) => {
        const payable = Number(getField(row, "PAYABLEAMT")) || 0;

        const indAcc = getField(row, "INDACCNO");
        const axisAcc = getField(row, "AXISACCNO");
        const generalAcc = getField(row, "ACCNO");

        return {
            SRNO: index + 1,

            EMPID: getField(row, "EMPID") || "-",

            BILLNO: getField(row, "BILLNO") || "-",

            SLPNO: getField(row, "SLIPNO") || "-",

            EMPNAME: getField(row, "EMPNAME") || "-",

            // Account mapping
            ADVACCNO:
                (axisAcc && axisAcc !== "-"
                    ? axisAcc
                    : generalAcc) || "-",

            INDIANACCNO: indAcc || "-",

            // Repository is unchanged; IFSC is not fetched
            IFSCCODE: "-",

            // Keep the original account available for reference
            ACCNO: generalAcc || "-",

            PAYABLEAMT: formatAmount(payable)
        };
    });

    const now = new Date();

    const printDate = now.toLocaleDateString("en-GB");

    const printTime = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });

    // Prepare HTML data
    const html = template({
        corporationName: corporationName || "",
        corporationLogo: corporationLogo || "",

        salaryMonth: salaryMonth || "",

        department:
            filters.deptName ||
            (Number(filters.deptId) === -1
                ? "All"
                : filters.deptId),

        bank:
            filters.bankName ||
            (Number(filters.bankId) === -1
                ? "All"
                : filters.bankId),

        subDept:
            filters.subDeptName ||
            (Number(filters.subdeptId) === -1
                ? "All"
                : filters.subdeptId),

        printDate,
        printTime,
        userId: userId || "",

        rows: reportRows,

        cashCheque: formatAmount(cashCheque),
        indianBankPayment: formatAmount(indianBankPayment),
        axisBankPayment: formatAmount(axisBankPayment),
        grandTotal: formatAmount(grandTotal)
    });

    // Chrome path
    const chromePath = path.resolve(
        __dirname,
        "../../../node_modules/puppeteer/.cache/puppeteer/chrome/win64-135.0.7049.84/chrome-win64/chrome.exe"
    );

    const launchOptions = {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ]
    };

    if (fs.existsSync(chromePath)) {
        launchOptions.executablePath = chromePath;
        console.log("Using Chrome:", chromePath);
    } else {
        console.log("Using Puppeteer default Chrome");
    }

    let browser;

    try {
        browser = await puppeteer.launch(launchOptions);

        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: "networkidle0",
            timeout: 0
        });

        // Wait for fonts and images
        await page.evaluate(async () => {
            await document.fonts.ready;

            await Promise.all(
                Array.from(document.images).map((img) => {
                    if (img.complete) {
                        return Promise.resolve();
                    }

                    return new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                })
            );
        });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: "A4",
            landscape: false,
            printBackground: true,
            preferCSSPageSize: true,
            displayHeaderFooter: false,
            margin: {
                top: "5mm",
                right: "7mm",
                bottom: "5mm",
                left: "7mm"
            }
        });

        // Output folder
        const outputDir = path.resolve(
            __dirname,
            "../../../public/pdf"
        );

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, {
                recursive: true
            });
        }

        // Save PDF
        const fileName = `BankList_${Date.now()}.pdf`;

        const filePath = path.join(
            outputDir,
            fileName
        );

        fs.writeFileSync(filePath, pdfBuffer);

        return {
            fileName,
            filePath
        };

    } catch (error) {
        console.error(
            "Bank List PDF generation failed:",
            error
        );

        throw error;

    } finally {
        if (browser) {
            await browser.close().catch((error) => {
                console.error(
                    "Failed to close Puppeteer browser:",
                    error
                );
            });
        }
    }
};

module.exports = {
    BankListReportPDFHelper
};
