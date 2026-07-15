const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

/**
 * ==========================================================
 * Bill Generation PDF Helper
 * ==========================================================
 */
const BillGenerationPDFHelper = async ({
  reportType,
  reportData,
  ulbInfo,
  salDate,
  department,
  billNo,
  generatedBy,
}) => {
  let browser;

  try {
    console.log("========== BILL PDF START ==========");

    /**
     * ======================================================
     * Validation
     * ======================================================
     */

    if (!reportData) {
      throw new Error("Report data is missing.");
    }

    if (
      reportType === "DETAIL" &&
      !Array.isArray(reportData.detail)
    ) {
      throw new Error("Detail report data is missing.");
    }

    if (
      reportType === "SUMMARY" &&
      !Array.isArray(reportData.summary)
    ) {
      throw new Error("Summary report data is missing.");
    }

    /**
     * ======================================================
     * Template
     * ======================================================
     */

    const templateName =
      reportType === "DETAIL"
        ? "FrmBillGenbillDetail.html"
        : "FrmBillGenbillSummary.html";

    const templatePath = path.resolve(
      __dirname,
      "../../templates",
      templateName
    );

    console.log("Template :", templatePath);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found : ${templatePath}`);
    }

    const htmlFile = fs.readFileSync(templatePath, "utf8");

    const template = Handlebars.compile(htmlFile);

    /**
     * ======================================================
     * Salary Month
     * ======================================================
     */

    let monthName = "";
    let year = "";

    if (salDate) {
      const [, mon, yr] = salDate.split("-");

      year = yr;

      const months = {
        Jan: "January",
        Feb: "February",
        Mar: "March",
        Apr: "April",
        May: "May",
        Jun: "June",
        Jul: "July",
        Aug: "August",
        Sep: "September",
        Oct: "October",
        Nov: "November",
        Dec: "December",
      };

      monthName = months[mon] || mon;
    }

    /**
     * ======================================================
     * Detail Rows
     * ======================================================
     */

    const reportRows =
      (
        reportType === "DETAIL"
          ? reportData.detail
          : reportData.summary
      ) || [];

    const detailRows = reportRows.map((row, index) => ({
      SRNO: index + 1,

      Earning_Head: row.Earning_Head || "",

      Earning_Amount: Number(
        row.Earning_Amount || 0
      ).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      }),

      Deduction_Head: row.Deduction_Head || "",

      Deduction_Amount: Number(
        row.Deduction_Amount || 0
      ).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      }),
    }));

    /**
     * ======================================================
     * Sub Detail
     * ======================================================
     */

    const subDetailRows = (reportData.subDetail || []).map(
      (row, index) => ({
        SRNO: index + 1,

        BILLNO: row.BILLNO || "",

        PAYHEADS_ENAME:
          row.PAYHEADS_ENAME || "",

        AMOUNT: Number(
          row.AMOUNT || 0
        ).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
      })
    );

    console.log("Detail Rows :", detailRows.length);
    console.log("Sub Detail :", subDetailRows.length);

   
         const html = template({
      corporationName:
        ulbInfo?.ABC_MUNICIPAL_TEXT || "नगर परिषद",

      logo: ulbInfo?.ULBLOGO || "",

      generatedDate: salDate,

      generatedBy: generatedBy || "SYSTEM",

      department: department || "",

      BILLNO: billNo || "",

      MONTHNAME: monthName,

      YEAR: year,

      salaryMonth: `${monthName} ${year}`,

      detail: detailRows,

      subDetail: subDetailRows,

      returnedSalary: subDetailRows.length > 0,

      AMOUNTINWORDS: "",

      CHEQUENO: "",

      CHEQUEDATE: "",

      netEarning: Number(
        reportData.netEarning || 0
      ).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      }),

      netDeduction: Number(
        reportData.netDeduction || 0
      ).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      }),

      netPayable: Number(
        reportData.netPayable || 0
      ).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      }),
    });

    console.log("HTML Generated");

  

    const launchOptions = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-extensions",
      ],
    };

    const chromePath = path.resolve(
      __dirname,
      "../../../node_modules/puppeteer/.cache/puppeteer/chrome/win64-135.0.7049.84/chrome-win64/chrome.exe"
    );

    if (fs.existsSync(chromePath)) {
      launchOptions.executablePath = chromePath;
    }

    console.log(
      "Chrome :",
      launchOptions.executablePath || "Default"
    );

    browser = await puppeteer.launch(launchOptions);

    console.log("Chrome Started");

    const page = await browser.newPage();

    await page.setViewport({
      width: 1200,
      height: 1700,
    });

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 0,
    });

    await page.emulateMediaType("screen");

    console.log("Generating PDF...");

    const pdfBuffer = await page.pdf({
      format: "A4",

      landscape:
        reportType === "SUMMARY",

      printBackground: true,

      displayHeaderFooter: false,

      preferCSSPageSize: true,

      margin: {
        top: "10mm",
        bottom: "10mm",
        left: "10mm",
        right: "10mm",
      },
    });

    /**
     * ======================================================
     * Save PDF
     * ======================================================
     */

    const outputDir = path.resolve(
      __dirname,
      "../../../public/pdf"
    );

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {
        recursive: true,
      });
    }

    const prefix =
      reportType === "DETAIL"
        ? "Bill_Detail_Report"
        : "Bill_Summary_Report";

    const fileName =
      `${prefix}_${Date.now()}.pdf`;

    const filePath = path.join(
      outputDir,
      fileName
    );

    fs.writeFileSync(
      filePath,
      pdfBuffer
    );

    console.log(
      "PDF Saved :",
      filePath
    );

    return {
      fileName,
      filePath,
    };

  } catch (err) {

    console.error(
      "========== BILL PDF ERROR =========="
    );

    console.error(
      "Message :",
      err.message
    );

    console.error(err.stack);

    throw err;

  } finally {

    if (browser) {
      await browser.close();
    }

    console.log(
      "========== BILL PDF END =========="
    );
  }
};

module.exports = {
  BillGenerationPDFHelper,
};