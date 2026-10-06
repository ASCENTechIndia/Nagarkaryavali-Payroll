const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

const BankListReportPDFHelper = async ({
    rows,
    filters,
    salaryMonth,
    corporationName,
    corporationLogo,
    userId
}) => {
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
            SRNO: index + 1,
            EMPID: row.EMPID || row.EMPCODE || "",
            EMPNAME: row.EMPNAME || "",
            DEPTNAME: row.DEPTNAME || "",
            BANKNAME: row.BANKNAME || "",
            ACCNO:
                row.ACCNO ||
                row.INDACCNO ||
                row.AXISACCNO ||
                "",
            PAYABLEAMT: payable.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
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

    const html = template({
        corporationName: corporationName || "",
        corporationLogo: corporationLogo || "",
        salaryMonth,

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

        subDept: filters.subDeptName || "",

        printDate,
        printTime,

        userId: userId || "",

        rows: reportRows,

        grandTotal: grandTotal.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    });

    //--------------------------------------------------
    // Chrome Path
    //--------------------------------------------------

    const chromePath = path.resolve(
        __dirname,
        "../../../node_modules/puppeteer/.cache/puppeteer/chrome/win64-135.0.7049.84/chrome-win64/chrome.exe"
    );

    //--------------------------------------------------
    // Puppeteer Launch Options
    //--------------------------------------------------

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
        console.log(
            "Chrome path not found, using Puppeteer's default executable."
        );
    }

    //--------------------------------------------------
    // Launch Browser
    //--------------------------------------------------

    let browser;

    try {
        browser = await puppeteer.launch(launchOptions);

        const page = await browser.newPage();

        //--------------------------------------------------
        // Set HTML
        //--------------------------------------------------

        await page.setContent(html, {
            waitUntil: "networkidle0",
            timeout: 0
        });

        //--------------------------------------------------
        // Wait For Images
        //--------------------------------------------------

        await page.evaluate(async () => {
            const images = Array.from(document.images);

            await Promise.all(
                images.map((img) => {
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

        //--------------------------------------------------
        // Generate PDF
        //--------------------------------------------------

        const pdfBuffer = await page.pdf({
            format: "A4",
            landscape: false,
            printBackground: true,
            preferCSSPageSize: true,
            margin: {
                top: "8mm",
                right: "8mm",
                bottom: "8mm",
                left: "8mm"
            }
        });

        //--------------------------------------------------
        // Output Folder
        //--------------------------------------------------

        const outputDir = path.resolve(
            __dirname,
            "../../../public/pdf"
        );

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, {
                recursive: true
            });
        }

        //--------------------------------------------------
        // Save PDF
        //--------------------------------------------------

        const fileName = `BankList_${Date.now()}.pdf`;

        const filePath = path.join(
            outputDir,
            fileName
        );

        fs.writeFileSync(
            filePath,
            pdfBuffer
        );

        //--------------------------------------------------
        // Return
        //--------------------------------------------------

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
            try {
                await browser.close();
            } catch (error) {
                console.error(
                    "Failed to close Puppeteer browser:",
                    error
                );
            }
        }
    }
};

module.exports = {
    BankListReportPDFHelper
};