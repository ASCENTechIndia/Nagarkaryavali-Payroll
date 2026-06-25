const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

// Register Handlebars helpers
Handlebars.registerHelper("formatDate", function(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
});

Handlebars.registerHelper("formatGender", function(gender) {
  if (!gender) return "N/A";
  const genderMap = { "M": "Male", "F": "Female", "O": "Other" };
  return genderMap[gender] || gender;
});

Handlebars.registerHelper("ifCond", function(v1, operator, v2, options) {
  switch (operator) {
    case "==":
      return (v1 == v2) ? options.fn(this) : options.inverse(this);
    case "===":
      return (v1 === v2) ? options.fn(this) : options.inverse(this);
    case "!=":
      return (v1 != v2) ? options.fn(this) : options.inverse(this);
    case "!==":
      return (v1 !== v2) ? options.fn(this) : options.inverse(this);
    case "<":
      return (v1 < v2) ? options.fn(this) : options.inverse(this);
    case "<=":
      return (v1 <= v2) ? options.fn(this) : options.inverse(this);
    case ">":
      return (v1 > v2) ? options.fn(this) : options.inverse(this);
    case ">=":
      return (v1 >= v2) ? options.fn(this) : options.inverse(this);
    case "&&":
      return (v1 && v2) ? options.fn(this) : options.inverse(this);
    case "||":
      return (v1 || v2) ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

Handlebars.registerHelper("increment", function(index) {
  return index + 1;
});

Handlebars.registerHelper("toFixed", function(number, digits) {
  if (number === undefined || number === null) return "0.00";
  return Number(number).toFixed(digits || 2);
});

const EsevaReportPDFHelper = async ({
  reportData,
  ulbId,
  userId,
  userName,
  corporationName
}) => {
  const templatePath = path.resolve(
    __dirname,
    "../../templates/FrmEsevaReport.html"
  );

  const htmlFile = fs.readFileSync(templatePath, "utf8");
  const template = Handlebars.compile(htmlFile);

  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const currentTime = new Date().toLocaleTimeString("en-GB");

  const html = template({
    logo: "",
    corporationName: corporationName,
    reportDate: reportDate,
    currentTime: currentTime,
    userId: userId,
    userName: userName,
    personalInfo: reportData.personalInfo,
    addressDetails: reportData.addressDetails,
    emergencyDetails: reportData.emergencyDetails,
    familyDetails: reportData.familyDetails,
    educationDetails: reportData.educationDetails,
    additionalTraining: reportData.additionalTraining,
    ptTraining: reportData.ptTraining,
    training: reportData.training,
    nominationDetails: reportData.nominationDetails,
    postingRecords: reportData.postingRecords,
    leaveRecords: reportData.leaveRecords,
    loanAdvanceRecords: reportData.loanAdvanceRecords,
    appendix: reportData.appendix,
    hasNomination: reportData.nominationDetails && reportData.nominationDetails.length > 0,
    hasFamily: reportData.familyDetails && reportData.familyDetails.length > 0,
    hasEducation: reportData.educationDetails && reportData.educationDetails.length > 0,
    hasAdditionalTraining: reportData.additionalTraining && reportData.additionalTraining.length > 0,
    hasPTTraining: reportData.ptTraining && reportData.ptTraining.length > 0,
    hasTraining: reportData.training && reportData.training.length > 0,
    hasPostingRecords: (reportData.postingRecords.previousService && reportData.postingRecords.previousService.length > 0) ||
                      (reportData.postingRecords.foreignService && reportData.postingRecords.foreignService.length > 0) ||
                      (reportData.postingRecords.verifiedService && reportData.postingRecords.verifiedService.length > 0),
    hasLeaveRecords: Object.values(reportData.leaveRecords).some(arr => arr && arr.length > 0),
    hasLoanAdvances: (reportData.loanAdvanceRecords.interestBearingAdvances && reportData.loanAdvanceRecords.interestBearingAdvances.length > 0)
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
    printBackground: true,
    margin: {
      top: "15mm",
      bottom: "15mm",
      left: "12mm",
      right: "12mm"
    }
  });

  await browser.close();

  // Save PDF
  const outputDir = path.resolve(__dirname, "../../../public/pdf");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const empCode = reportData.personalInfo?.empcode || "unknown";
  const fileName = `Eseva_Report_${empCode}_${Date.now()}.pdf`;
  const filePath = path.join(outputDir, fileName);
  fs.writeFileSync(filePath, pdfBuffer);

  return {
    fileName,
    filePath
  };
};

module.exports = {
  EsevaReportPDFHelper
};