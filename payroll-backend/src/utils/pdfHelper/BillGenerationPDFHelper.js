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

  const templatePath = path.resolve(
    __dirname,
    "../../templates",
    templateName
  );

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found : ${templateName}`);
  }

  const htmlFile = fs.readFileSync(
    templatePath,
    "utf8"
  );

  const template = Handlebars.compile(htmlFile);

  /**
   * ==========================================
   * Detail Rows
   * ==========================================
   */

  const detailRows =
    (reportData.detail || []).map((row, index) => ({

      SRNO: index + 1,

      Earning_Head:
        row.Earning_Head || "",

      Earning_Amount:
        Number(row.Earning_Amount || 0).toLocaleString(
          "en-IN",
          {
            minimumFractionDigits: 2,
          }
        ),

      Deduction_Head:
        row.Deduction_Head || "",

      Deduction_Amount:
        Number(row.Deduction_Amount || 0).toLocaleString(
          "en-IN",
          {
            minimumFractionDigits: 2,
          }
        ),

    }));


  /**
   * ==========================================
   * Sub Detail
   * ==========================================
   */

  const subDetailRows =
    (reportData.subDetail || []).map((row, index) => ({

      SRNO: index + 1,

      BILLNO:
        row.BILLNO || "",

      PAYHEADS_ENAME:
        row.PAYHEADS_ENAME || "",

      AMOUNT:
        Number(row.AMOUNT || 0).toLocaleString(
          "en-IN",
          {
            minimumFractionDigits: 2,
          }
        ),

    }));


  /**
   * ==========================================
   * Template Data
   * ==========================================
   */

const html = template({

    corporationName:
        ulbInfo?.ABC_MUNICIPAL_TEXT || "नगर परिषद",

    logo:
        ulbInfo?.ULBLOGO || "",

    generatedDate:
        new Date().toLocaleDateString("en-GB"),

    detail: detailRows,

    subDetail: subDetailRows,

    netEarning:
        Number(reportData.netEarning || 0).toLocaleString("en-IN",{
            minimumFractionDigits:2
        }),

    netDeduction:
        Number(reportData.netDeduction || 0).toLocaleString("en-IN",{
            minimumFractionDigits:2
        }),

    netPayable:
        Number(reportData.netPayable || 0).toLocaleString("en-IN",{
            minimumFractionDigits:2
        })

});

    /**
   * ==========================================================
   * Chrome Path
   * ==========================================================
   */
  const chromePath = path.resolve(
    __dirname,
    "../../../node_modules/puppeteer/.cache/puppeteer/chrome/win64-135.0.7049.84/chrome-win64/chrome.exe"
  );

  const launchOptions = {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  };

  if (fs.existsSync(chromePath)) {
    launchOptions.executablePath = chromePath;
  }

  /**
   * ==========================================================
   * Launch Browser
   * ==========================================================
   */
  const browser = await puppeteer.launch(launchOptions);

  try {

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 0,
    });

    await page.emulateMediaType("screen");

    /**
     * ======================================================
     * PDF Options
     * ======================================================
     */
    const pdfBuffer = await page.pdf({

      format: "A4",

      landscape: reportType === "SUMMARY",

      printBackground: true,

      displayHeaderFooter: false,

      margin: {
        top: "12mm",
        bottom: "12mm",
        left: "10mm",
        right: "10mm",
      },

      preferCSSPageSize: true,

    });

    /**
     * ======================================================
     * Output Directory
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

    /**
     * ======================================================
     * File Name
     * ======================================================
     */
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

    return {

      fileName,

      filePath,

    };

  } finally {

    await browser.close();

  }

};

module.exports = {
  BillGenerationPDFHelper,
};