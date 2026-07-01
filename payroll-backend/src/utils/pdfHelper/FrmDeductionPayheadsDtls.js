const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

const DeductionPayheadsPDFHelper = async ({
  rows,
  payheadId,
  month,
  year,
  ulbId,
  userId
}) => {
  const templatePath = path.resolve(
    __dirname,
    "../../templates/FrmDeductionPayheadsDtls.html"
  );

  const htmlFile = fs.readFileSync(templatePath, "utf8");
  const template = Handlebars.compile(htmlFile);

  // Calculate grand total
  const grandTotal = rows.reduce(
    (sum, row) => sum + Number(row.AMOUNT || 0),
    0
  );

  // Get payhead name based on ID
  let reportTitle = "मासिक हफ्ते कपात अहवाल";
  if (["359", "269", "267", "358"].includes(String(payheadId))) {
    reportTitle = "बँक/पतसंस्था कर्जाचे मासिक हफ्ते कपात अहवाल";
  }

  // Format month name
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthName = monthNames[month - 1];
  const period = `${monthName} - ${year}`;

  // Format the report date
  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  // Prepare rows with serial numbers
  const reportRows = rows.map((row, index) => ({
    srNo: index + 1,
    empId: row.EMPID,
    engName: row.ENGNAME,
    deductionNo: row.DEDUCTIONNO || "",
    amount: Number(row.AMOUNT || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    salDate: row.SALDATE,
    deptName: row.DEPTNAMEE
  }));

  // Get corporation info
  const corporationInfo = {
    name: "Municipal Corporation",
    address: "Main Office, City",
    logo: ""
  };

  const html = template({
    logo: corporationInfo.logo,
    corporationName: corporationInfo.name,
    corporationAddress: corporationInfo.address,
    reportTitle: reportTitle,
    period: period,
    reportDate: reportDate,
    userId: userId,
    rows: reportRows,
    grandTotal: grandTotal.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    totalRecords: rows.length
  });

  // Puppeteer launch options
  const chromePath = path.resolve(
    __dirname,
    "../../../node_modules/puppeteer/.cache/puppeteer/chrome/win64-135.0.7049.84/chrome-win64/chrome.exe"
  );

  const launchOptions = {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  };

  if (fs.existsSync(chromePath)) {
    launchOptions.executablePath = chromePath;
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0",
    timeout: 0
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    landscape: true,
    printBackground: true,
    margin: {
      top: "10mm",
      bottom: "10mm",
      left: "10mm",
      right: "10mm"
    }
  });

  await browser.close();

  // Save PDF
  const outputDir = path.resolve(__dirname, "../../../public/pdf");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `DeductionPayheads_${Date.now()}.pdf`;
  const filePath = path.join(outputDir, fileName);
  fs.writeFileSync(filePath, pdfBuffer);

  return {
    fileName,
    filePath
  };
};

module.exports = {
  DeductionPayheadsPDFHelper
};