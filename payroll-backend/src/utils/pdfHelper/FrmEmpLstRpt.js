const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

const EmployeeListPDFHelper = async ({
  rows,
  ulbInfo,
}) => {

  const templatePath = path.resolve(
    __dirname,
    "../../templates/FrmEmpLstRpt.html"
  );

  const htmlFile = fs.readFileSync(
    templatePath,
    "utf8"
  );

  const template = Handlebars.compile(htmlFile);

  const employees = rows.map((row, index) => ({
    SRNO: index + 1,

    ...row,

    BASICSAL: Number(
      row.BASICSAL || 0
    ).toLocaleString("en-IN"),

    GRADEPAY: Number(
      row.GRADEPAY || 0
    ).toLocaleString("en-IN"),

    printDate: new Date().toLocaleDateString("en-GB"),
  }));

  const html = template({
    logo: ulbInfo.ULBLOGO,
    corporationName:
      ulbInfo.ABC_MUNICIPAL_TEXT,
    employees,
  });

  const chromePath = path.resolve(
    __dirname,
    "../../../node_modules/puppeteer/.cache/puppeteer/chrome/win64-135.0.7049.84/chrome-win64/chrome.exe"
  );

  const launchOptions = {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  };

  if (fs.existsSync(chromePath)) {
    launchOptions.executablePath =
      chromePath;
  }

  const browser =
    await puppeteer.launch(launchOptions);

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0",
    timeout: 0,
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    landscape: false,
    printBackground: true,
  });

  await browser.close();

  const outputDir = path.resolve(
    __dirname,
    "../../../public/pdf"
  );

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {
      recursive: true,
    });
  }

  const fileName =
    `EmployeeMaster_${Date.now()}.pdf`;

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
};

module.exports = {
  EmployeeListPDFHelper,
};