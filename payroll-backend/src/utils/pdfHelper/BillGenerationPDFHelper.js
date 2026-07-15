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
  /**
   * ==========================================
   * Template
   * ==========================================
   */
  const templateName =
    reportType === "DETAIL"
      ? "FrmBillGenbillDetail.html"
      : "FrmBillGenbillSummary.html";

  const templatePath = path.resolve(__dirname, "../../templates", templateName);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found : ${templateName}`);
  }

  const htmlFile = fs.readFileSync(templatePath, "utf8");

  const template = Handlebars.compile(htmlFile);

  /**
   * ==========================================
   * Detail Rows
   * ==========================================
   */

  const reportRows = (
    reportType === "DETAIL" ? reportData.detail || [] : reportData.summary || []
  ).map((row, index) => ({
    SRNO: index + 1,

    Earning_Head: row.Earning_Head || "",

    Earning_Amount: Number(row.Earning_Amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    }),

    Deduction_Head: row.Deduction_Head || "",

    Deduction_Amount: Number(row.Deduction_Amount || 0).toLocaleString(
      "en-IN",
      { minimumFractionDigits: 2 },
    ),
  }));

  /**
   * ==========================================
   * Sub Detail
   * ==========================================
   */

  const subDetailRows = (reportData.subDetail || []).map((row, index) => ({
    SRNO: index + 1,

    BILLNO: row.BILLNO || "",

    PAYHEADS_ENAME: row.PAYHEADS_ENAME || "",

    AMOUNT: Number(row.AMOUNT || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    }),
  }));

  /**
   * ==========================================
   * Template Data
   * ==========================================
   */

  const salaryMonth = (() => {
    if (!salDate) return "";

    const [, mon, year] = salDate.split("-");

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

    return `${months[mon]} ${year}`;
  })();

  console.log("========== REPORT DATA ==========");
  console.log(JSON.stringify(reportData, null, 2));

  if (!reportData) {
    throw new Error("reportData is undefined.");
  }

  if (reportType === "DETAIL" && !Array.isArray(reportData.detail)) {
    throw new Error("Detail report data is missing.");
  }

  if (reportType === "SUMMARY" && !Array.isArray(reportData.summary)) {
    throw new Error("Summary report data is missing.");
  }

  const html = template({
    corporationName: ulbInfo?.ABC_MUNICIPAL_TEXT || "नगर परिषद",

    logo: ulbInfo?.ULBLOGO || "",

    generatedDate: salDate,

    generatedBy: generatedBy,

    salaryMonth: salaryMonth,

    department: department,

    BILLNO: billNo,

    detail: reportRows,

    subDetail: subDetailRows,

    netEarning: Number(reportData.netEarning || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    }),

    netDeduction: Number(reportData.netDeduction || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    }),

    netPayable: Number(reportData.netPayable || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    }),
  });

  /**
   * ==========================================================
   * Chrome Path
   * ==========================================================
   */
  const launchOptions = {
    headless: "new",
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
    "../../../node_modules/puppeteer/.cache/puppeteer/chrome/win64-135.0.7049.84/chrome-win64/chrome.exe",
  );

  if (fs.existsSync(chromePath)) {
    launchOptions.executablePath = chromePath;
  }

  console.log("Launching Chrome...");
  console.log(
    "Chrome Path:",
    launchOptions.executablePath || "Default Puppeteer Chrome",
  );

  let browser;

  try {
    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 0,
    });

    await page.emulateMediaType("screen");

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: reportType === "SUMMARY",
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true,
      margin: {
        top: "12mm",
        bottom: "12mm",
        left: "10mm",
        right: "10mm",
      },
    });

    const outputDir = path.resolve(__dirname, "../../../public/pdf");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const prefix =
      reportType === "DETAIL" ? "Bill_Detail_Report" : "Bill_Summary_Report";

    const fileName = `${prefix}_${Date.now()}.pdf`;

    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, pdfBuffer);

    return {
      fileName,
      filePath,
    };
  } catch (err) {
    console.error("========== PDF GENERATION ERROR ==========");
    console.error(err);
    throw err;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = {
  BillGenerationPDFHelper,
};
