const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

const DesigwiseEmpCountPDFHelper = async ({
    rows,
    filters,
    salaryMonth,
    salaryDate,
    corporationName,
    corporationLogo,
    userId
}) => {
    const templatePath = path.resolve(
        __dirname,
        "../../templates/FrmDesigwiseEmpCount.html"
    );

    const htmlFile = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(htmlFile);

    let totalWorking = 0;
    let totalRikt    = 0;
    let totalPost    = 0;

    const reportRows = rows.map((row, index) => {
        const working = Number(row.WORKING || 0);
        const rikt    = Number(row.RIKT    || 0);
        const post    = Number(row.POST    || 0);

        totalWorking += working;
        totalRikt    += rikt;
        totalPost    += post;

        return {
            SRNO:        index + 1,
            DESIGNATION: row.DESIGNATION || "",
            WORKING:     working,
            RIKT:        rikt,
            POST:        post,
        };
    });

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

    const html = template({
        corporationName: corporationName || "",
        corporationLogo: corporationLogo || "",
        salaryMonth,
        salaryDate,
        department:
            filters.deptName ||
            (String(filters.deptId) === "-1" ? "All" : filters.deptId),
        empType:    filters.empType || "",
        printDate,
        printTime,
        userId:     userId || "",
        rows:       reportRows,
        totalWorking,
        totalRikt,
        totalPost,
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
        ],
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

        // Wait for images
        await page.evaluate(async () => {
            const images = Array.from(document.images);
            await Promise.all(
                images.map((img) => {
                    if (img.complete) return Promise.resolve();
                    return new Promise((resolve) => {
                        img.onload  = resolve;
                        img.onerror = resolve;
                    });
                })
            );
        });

        const pdfBuffer = await page.pdf({
            format:           "A4",
            landscape:        false,
            printBackground:  true,
            preferCSSPageSize: true,
            margin: { top: "8mm", right: "8mm", bottom: "8mm", left: "8mm" },
        });

        const outputDir = path.resolve(__dirname, "../../../public/pdf");
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const fileName = `DesigwiseEmpCount_${Date.now()}.pdf`;
        const filePath = path.join(outputDir, fileName);
        fs.writeFileSync(filePath, pdfBuffer);

        return { fileName, filePath };
    } catch (error) {
        console.error("DesigwiseEmpCount PDF generation failed:", error);
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

module.exports = { DesigwiseEmpCountPDFHelper };
