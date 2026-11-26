const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

const DeleteEmployeeReportPDFHelper = async ({
    rows,
    filters,
    corporationName,
    corporationLogo,
    userId,
}) => {
    const templatePath = path.resolve(
        __dirname,
        "../../templates/FrmDeleteEmployeeReport.html"
    );

    const htmlFile = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(htmlFile);

    const reportRows = rows.map((row, index) => ({
        SRNO: index + 1,
        SLIPNO: row.SLIPNO || "",
        BILLNO: row.BILLNO || "",
        EMPLOYEENAME: row.EMPLOYEENAME || "",
        DEPTNAME: row.DEPTNAME || "",
        DELETEDT: row.DELETEDT || "",
    }));

    const now = new Date();
    const printDate = now.toLocaleDateString("en-GB");
    const printTime = now
        .toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        })
        .replace(/\s+([AP]M)/i, (_, meridiem) => meridiem.toUpperCase());

    const billDisplay =
        filters.billNo && String(filters.billNo) !== "-1" && String(filters.billNo) !== "0"
            ? filters.billNo
            : "All";

    const html = template({
        corporationName: corporationName || "",
        corporationLogo: corporationLogo || "",
        department:
            filters.deptName ||
            (String(filters.deptId) === "-1" || String(filters.deptId) === "0"
                ? "All"
                : filters.deptId),
        billNo: billDisplay,
        printDate,
        printTime,
        userId: userId || "",
        totalRecords: reportRows.length,
        rows: reportRows,
    });

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

        await page.setContent(html, { waitUntil: "networkidle0", timeout: 0 });

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
            landscape: false,
            printBackground: true,
            preferCSSPageSize: true,
            margin: { top: "8mm", right: "8mm", bottom: "8mm", left: "8mm" },
        });

        const outputDir = path.resolve(__dirname, "../../../public/pdf");
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const fileName = `DeleteEmployeeRecord_${Date.now()}.pdf`;
        const filePath = path.join(outputDir, fileName);
        fs.writeFileSync(filePath, pdfBuffer);

        return { fileName, filePath };
    } catch (error) {
        console.error("Delete Employee Record PDF generation failed:", error);
        throw error;
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (err) {
                console.error("Failed to close Puppeteer browser:", err);
            }
        }
    }
};

module.exports = { DeleteEmployeeReportPDFHelper };
