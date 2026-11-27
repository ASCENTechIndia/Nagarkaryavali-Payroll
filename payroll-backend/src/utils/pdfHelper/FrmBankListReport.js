
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

// ==========================================
// FORMAT AMOUNT
// ==========================================

const formatAmount = (value) => {
    const amount = Number(value ?? 0);

    return (Number.isFinite(amount) ? amount : 0).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
};

// ==========================================
// GET ORACLE FIELD (CASE INSENSITIVE)
// ==========================================

const getField = (row, key, defaultValue = "") => {
    if (!row) return defaultValue;

    const actualKey = Object.keys(row).find(
        k => k.toUpperCase() === key.toUpperCase()
    );

    if (actualKey === undefined || row[actualKey] == null) {
        return defaultValue;
    }

    return row[actualKey];
};

// ==========================================
// CHECK ACCOUNT NUMBER
// ==========================================

const hasAccount = (value) => {
    if (value == null) return false;

    const account = String(value).trim();

    return account !== "" && account !== "-";
};

// ==========================================
// PDF GENERATION
// ==========================================

const BankListReportPDFHelper = async ({
    rows,
    data,
    filters = {},
    salaryMonth,
    corporationName,
    corporationLogo,
    userId,

    cashCheque,
    indianBankPayment,
    axisBankPayment,
    grandTotal,

    paymentSummary
}) => {

    try {

        // ==========================================
        // 1. NORMALIZE INPUT DATA
        // ==========================================

        const reportData = rows ?? data ?? [];

        if (!Array.isArray(reportData) || reportData.length === 0) {
            throw new Error("Bank list report data is empty.");
        }

        const summary = paymentSummary || {};

        const finalCashCheque =
            summary.cashCheque ?? cashCheque ?? 0;

        const finalIndianBankPayment =
            summary.indianBankPayment ?? indianBankPayment ?? 0;

        const finalAxisBankPayment =
            summary.axisBankPayment ?? axisBankPayment ?? 0;

        const finalGrandTotal =
            summary.grandTotal ?? grandTotal ??
            reportData.reduce((total, row) => {
                return total + (
                    Number(getField(row, "PAYABLEAMT", 0)) || 0
                );
            }, 0);

        const ulbID = Number(filters.ulbid ?? filters.ulbId);

        // ==========================================
        // 2. HTML TEMPLATE
        // ==========================================

        const templatePath = path.resolve(
            __dirname,
            "../../templates/FrmBankListReport.html"
        );

        if (!fs.existsSync(templatePath)) {
            throw new Error(
                `Bank List HTML template not found: ${templatePath}`
            );
        }

        const htmlFile = fs.readFileSync(templatePath, "utf8");

        const template = Handlebars.compile(htmlFile);

        // ==========================================
        // 3. EMPLOYEE TABLE DATA
        // ==========================================

        const reportRows = reportData.map((row, index) => {

            const bankId = Number(getField(row, "BANKID", -1));

            const rawAccount = getField(
                row,
                "BANKACCOUNTNO",
                ""
            );

            let indianAccount = getField(row, "INDACCNO", "-");
            let axisAccount = getField(row, "AXISACCNO", "-");

            // Fallback for account numbers if CASE columns
            // are empty or missing in the repository result.
            if (ulbID === 1750 && hasAccount(rawAccount)) {

                if (bankId === 2 && !hasAccount(axisAccount)) {
                    axisAccount = rawAccount;
                }

                if (bankId !== 2 && !hasAccount(indianAccount)) {
                    indianAccount = rawAccount;
                }
            }

            // Other ULBs use general account number.
            if (ulbID !== 1750) {
                indianAccount = getField(row, "ACCNO", "-");
            }

            const payable = Number(
                getField(row, "PAYABLEAMT", 0)
            ) || 0;

            return {
                SRNO: index + 1,

                EMPID: getField(row, "EMPID", "-"),

                BILLNO: getField(row, "BILLNO", "-"),

                SLPNO: getField(row, "SLIPNO", "-"),

                EMPNAME: getField(row, "EMPNAME", "-"),

                INDIANACCNO: hasAccount(indianAccount)
                    ? String(indianAccount).trim()
                    : "-",

                AXISACCNO: hasAccount(axisAccount)
                    ? String(axisAccount).trim()
                    : "-",

                IFSCCODE: getField(row, "IFSC", "-") || "-",

                PAYABLEAMT: formatAmount(payable)
            };
        });

        // ==========================================
        // 4. PRINT DATE AND TIME
        // ==========================================

        const now = new Date();

        const printDate = now.toLocaleDateString("en-GB");

        const printTime = now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });

        // ==========================================
        // 5. FILTER DETAILS
        // ==========================================

        const department =
            filters.deptName ??
            (String(filters.deptId ?? "-1") === "-1"
                ? "All"
                : filters.deptId);

        const bank =
            filters.bankName ??
            (String(filters.bankId ?? "-1") === "-1"
                ? "All"
                : filters.bankId);

        const subDept =
            filters.subDeptName ??
            (String(filters.subdeptId ?? "-1") === "-1"
                ? "All"
                : filters.subdeptId);

        // ==========================================
        // 6. HANDLE CORPORATION LOGO
        // ==========================================

        let logo = corporationLogo || "";

        if (logo && !logo.startsWith("data:") &&
            !logo.startsWith("http://") &&
            !logo.startsWith("https://") &&
            !logo.startsWith("file://")) {

            const logoPath = path.resolve(logo);

            if (fs.existsSync(logoPath)) {
                const extension = path.extname(logoPath)
                    .toLowerCase();

                const mimeTypes = {
                    ".png": "image/png",
                    ".jpg": "image/jpeg",
                    ".jpeg": "image/jpeg",
                    ".gif": "image/gif",
                    ".svg": "image/svg+xml"
                };

                const mimeType =
                    mimeTypes[extension] || "image/png";

                logo =
                    `data:${mimeType};base64,` +
                    fs.readFileSync(logoPath).toString("base64");
            }
        }

        // ==========================================
        // 7. PREPARE HTML
        // ==========================================

        const html = template({

            corporationName: corporationName || "",

            corporationLogo: logo,

            salaryMonth: salaryMonth || "",

            department,

            bank,

            subDept,

            printDate,

            printTime,

            userId: userId || "",

            rows: reportRows,

            cashCheque: formatAmount(finalCashCheque),

            indianBankPayment: formatAmount(
                finalIndianBankPayment
            ),

            axisBankPayment: formatAmount(
                finalAxisBankPayment
            ),

            grandTotal: formatAmount(finalGrandTotal)

        });

        // ==========================================
        // 8. PUPPETEER CHROME
        // ==========================================

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

            await page.evaluate(async () => {

                await document.fonts.ready;

                await Promise.all(
                    Array.from(document.images).map(img => {

                        if (img.complete) {
                            return Promise.resolve();
                        }

                        return new Promise(resolve => {
                            img.onload = resolve;
                            img.onerror = resolve;
                        });
                    })
                );
            });

            // ==========================================
            // 9. GENERATE PDF
            // ==========================================

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

            // ==========================================
            // 10. SAVE PDF
            // ==========================================

            const outputDir = path.resolve(
                __dirname,
                "../../../public/pdf"
            );

            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, {
                    recursive: true
                });
            }

            const fileName = `BankList_${Date.now()}.pdf`;

            const filePath = path.join(
                outputDir,
                fileName
            );

            fs.writeFileSync(filePath, pdfBuffer);

            console.log("Bank List PDF generated:", filePath);

            return {
                fileName,
                filePath
            };

        } finally {

            if (browser) {
                await browser.close().catch(error => {
                    console.error(
                        "Failed to close Puppeteer browser:",
                        error
                    );
                });
            }
        }

    } catch (error) {

        console.error(
            "Bank List PDF generation failed:",
            error
        );

        throw error;
    }
};

module.exports = {
    BankListReportPDFHelper
};
