const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

const PayrollReportPDFHelper = async ({
  rows,
  reportType,
  reportName,
  ulbInfo,
  filters,
}) => {
  const templatePath = path.resolve(
    __dirname,
    "../../templates/FrmPayrollReport.html",
  );

  const htmlFile = fs.readFileSync(templatePath, "utf8");

  const template = Handlebars.compile(htmlFile);

  let grandTotal = 0;

  if (reportType === "1") {
    grandTotal = rows.reduce((sum, r) => sum + Number(r.NETSALARY || 0), 0);
  } else {
    grandTotal = rows.reduce(
      (sum, r) => sum + Number(r.AMOUNT || r.NETPAY || 0),
      0,
    );
  }

  let header = "";
  let subHeader = "";

  const reportDate = rows?.length
    ? new Date(rows[0].SALDATE)
    : new Date();

    const monthName = reportDate.toLocaleString("en-US", {
    month: "short",
  });

  const year = reportDate.getFullYear();

    if (reportType === "1") {
    header = "BANK LIST";
    subHeader = `Bank List for month of ${monthName}-${year} (Dept Wise)`;
  }

  if (reportType === "2") {
    header = "DEDUCTION REPORT";
    subHeader = `Bank List for month of ${monthName}-${year} (Dept Wise)`;
  }

  if (reportType === "4" || reportType === "5") {
    header = "";
    subHeader = `Statement of Salary Bill for ${monthName}-${year}`;
  }

  let reportRows = [];

if (reportType === "1") {
  reportRows = rows.map((row, index) => ({
    SRNO: index + 1,
    DEPTCODE: row.DEPTID,
    DEPTNAME: row.DEPNAME,
    EMPCODE: row.EMPCODE,
    EMPNAME: row.EMPNAME,
    BANKACCOUNTNO: row.ACCNO,
    NETSALARY: Number(row.AMOUNT || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    }),
  }));

  grandTotal = rows.reduce(
    (sum, row) => sum + Number(row.AMOUNT || 0),
    0
  );
} else if (reportType === "2") {

  reportRows = rows.map((row) => ({
    PRABHAG: row.COMMITTIE,
    DEPARTMENT: row.DEPNAME,
    EMPCODE: row.EMPCODE,
    NAME: row.EMPNAME,
    SHORTCODE: row.SHORTCODE || "",
    AMOUNT: Number(row.AMOUNT || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    }),
  }));

  grandTotal = rows.reduce(
    (sum, row) => sum + Number(row.AMOUNT || 0),
    0
  );
} else {

  reportRows = rows.map((row) => ({
    EMPID: row.EMPID,
    EMPNAME_AND_DESIG: row.EMPNAME_AND_DESIG,
    ACNO: row.ACNO,
    NETPAY: Number(row.NETPAY || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    }),
  }));

  grandTotal = rows.reduce(
    (sum, row) => sum + Number(row.NETPAY || 0),
    0
  );
}

  const html = template({
    logo: ulbInfo.ULBLOGO,
    corporationName: ulbInfo.ABC_MUNICIPAL_TEXT,

    printDate: new Date().toLocaleDateString("en-GB"),

    header,
    subHeader,

    rows: reportRows,
    grandTotal: grandTotal.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    }),

    isBankList: reportType === "1",
    isDeductionReport: reportType === "2",
    isEcsReport: reportType === "4" || reportType === "5",
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
  }

  const browser = await puppeteer.launch(launchOptions);

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0",
    timeout: 0,
  });

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

  const fileName = `Payroll_${Date.now()}.pdf`;

  const filePath = path.join(outputDir, fileName);

  fs.writeFileSync(filePath, pdfBuffer);

  return {
    fileName,
    filePath,
  };
};

module.exports = {
  PayrollReportPDFHelper,
};
