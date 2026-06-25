const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

const NetPayReportHelper = async ({ rows, reportName, ulbInfo, filters }) => {
  const templatePath = path.resolve(
    __dirname,
    "../../templates/FrmNetPayRpt.html"
  );

  const htmlFile = fs.readFileSync(templatePath, "utf8");
  const template = Handlebars.compile(htmlFile);

  // Calculate grand total
  const grandTotal = rows.reduce((sum, r) => sum + Number(r.NETSAL || 0), 0);

  // Format rows for display
  const reportRows = rows.map((row, index) => ({
    SRNO: index + 1,
    EMPID: row.EMPID,
    EMPNAME: row.EMPNAME,
    ACCNO: row.ACCNO,
    NETSAL: Number(row.NETSAL || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    }),
    DEPTNAME: row.DEPTNAME,
    BRANCHNAME: row.BRANCHNAME,
    EMPCLASS: row.EMPCLASS,
  }));

  const html = template({
    logo: ulbInfo.ULBLOGO || "",
    corporationName: ulbInfo.ABC_MUNICIPAL_TEXT || ulbInfo.corporationName,
    printDate: new Date().toLocaleDateString("en-GB"),
    reportName: reportName || "Net Pay Details",
    month: filters.month,
    year: filters.year,
    branchName: filters.brNameMar,
    userId: filters.userId,
    rows: reportRows,
    grandTotal: grandTotal.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    }),
    recordCount: rows.length,
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
    margin: {
      top: "10mm",
      right: "10mm",
      bottom: "10mm",
      left: "10mm",
    },
  });

  await browser.close();

  const outputDir = path.resolve(__dirname, "../../public/pdf");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `NetPay_${Date.now()}.pdf`;
  const filePath = path.join(outputDir, fileName);
  //const relativePath = `/reports/${fileName}`;

  fs.writeFileSync(filePath, pdfBuffer);

  return {
    fileName,
    filePath,
    //relativePath,
  };
};

const VacantPostsReportHelper = async ({ rows, reportName, ulbInfo, filters }) => {
  const templatePath = path.resolve(
    __dirname,
    "../../templates/FrmVacantPostsRpt.html"
  );

  const htmlFile = fs.readFileSync(templatePath, "utf8");
  const template = Handlebars.compile(htmlFile);

  // Format rows for display
  const reportRows = rows.map((row, index) => ({
    SRNO: index + 1,
    EMPID: row.EMPID,
    ENGNAME: row.ENGNAME,
    DEPTNAMEE: row.DEPTNAMEE,
    DESIGENAME: row.DESIGENAME,
  }));

  const html = template({
    logo: ulbInfo.ULBLOGO || "",
    corporationName: ulbInfo.ABC_MUNICIPAL_TEXT || ulbInfo.corporationName,
    printDate: new Date().toLocaleDateString("en-GB"),
    reportName: reportName || "रिक्तपद अहवाल",
    month: filters.month,
    year: filters.year,
    userId: filters.userId,
    rows: reportRows,
    recordCount: rows.length,
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
    margin: {
      top: "10mm",
      right: "10mm",
      bottom: "10mm",
      left: "10mm",
    },
  });

  await browser.close();

  const outputDir = path.resolve(__dirname, "../../../public/reports");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `VacantPosts_${Date.now()}.pdf`;
  const filePath = path.join(outputDir, fileName);
  //const relativePath = `/reports/${fileName}`;

  fs.writeFileSync(filePath, pdfBuffer);

  return {
    fileName,
    filePath,
    //relativePath,
  };
};

module.exports = {
  NetPayReportHelper,
  VacantPostsReportHelper,
};