const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

const imageToBase64 = (imgPath) => {
  if (!imgPath || !fs.existsSync(imgPath)) return "";
  const file = fs.readFileSync(imgPath);
  const ext = path.extname(imgPath).replace(".", "");
  return `data:image/${ext};base64,${file.toString("base64")}`;
};

Handlebars.registerHelper("formatNumber", function (value) {
  if (value === undefined || value === null || value === "") return "";
  const num = Number(value);
  if (isNaN(num)) return "";
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
});

Handlebars.registerHelper("getColValue", function (employee, colNo) {
  if (!colNo) return "";
  const val = employee[`col${colNo}`];
  if (val === undefined || val === null || val === "") return "";
  const num = Number(val);
  return isNaN(num)
    ? ""
    : num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
});

Handlebars.registerHelper("getTotalValue", function (totals, colNo) {
  if (!totals || !colNo) return "";
  const val =
    totals[`rTotal${colNo}`] !== undefined
      ? totals[`rTotal${colNo}`]
      : totals[`col${colNo}`];
  if (val === undefined || val === null || val === "") return "";
  const num = Number(val);
  return isNaN(num)
    ? ""
    : num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
});

const PAYHEAD_MAP = [
  { row: 1, col: 1,  dbCol: "BASICPAY",     title: "मूळ वेतन" },
  { row: 1, col: 2,  dbCol: "MAHAGAI",      title: "महागाई भत्ता" },
  { row: 1, col: 3,  dbCol: "HRA",          title: "घरभाडे भत्ता" },
  { row: 1, col: 5,  dbCol: "B_N_VARGANI",  title: "भ. नि. वर्गणी" },
  { row: 1, col: 6,  dbCol: "OTHER",        title: "इतर १" },
  { row: 1, col: 7,  dbCol: "P_F_KARJ",     title: "प्रा. फंड कर्ज" },
  { row: 1, col: 8,  dbCol: "ANSH_NIDHI14", title: "अंशदान निधी १४% मनपा" },
  { row: 1, col: 9,  dbCol: "ETARPATPEDI",  title: "इतर पतपेढी" },
  { row: 1, col: 10, dbCol: "VASULI",       title: "वसुली" },

  { row: 2, col: 1,  dbCol: "ETAR_BHATTA",     title: "इतर भत्ता" },
  { row: 2, col: 2,  dbCol: "GRADEPAY",        title: "ग्रेड वेतन" },
  { row: 2, col: 3,  dbCol: "WASHINGALLOWANCE",title: "धुलाई भत्ता" },
  { row: 2, col: 4,  dbCol: "PENALTY",         title: "इतर / दंड" },
  { row: 2, col: 5,  dbCol: "POST",            title: "पोस्ट" },
  { row: 2, col: 6,  dbCol: "BANK_LOAN",       title: "बँक कर्ज" },
  { row: 2, col: 7,  dbCol: "PRF_TAX",         title: "व्यवसाय कर" },
  { row: 2, col: 8,  dbCol: "FLAG",            title: "ध्वजनिधी" },
  { row: 2, col: 9,  dbCol: "OTHER_BANK",      title: "इतर बँक हप्ता" },
  { row: 2, col: 10, dbCol: "ITAX",            title: "आयकर" },

  { row: 3, col: 1,  dbCol: "VEHICLE",     title: "वाहन भत्ता" },
  { row: 3, col: 2,  dbCol: "MEDICAL",     title: "वैद्यकीय भत्ता" },
  { row: 3, col: 3,  dbCol: "DCPSE",       title: "मनपा हिस्सा १४%" },
  { row: 3, col: 4,  dbCol: "KAMGARSOC",   title: "कामगार सोसायटी" },
  { row: 3, col: 5,  dbCol: "GSBANK",      title: "ग. स. बँक" },
  { row: 3, col: 6,  dbCol: "ACCPOLICY",   title: "अपघात विमा" },
  { row: 3, col: 9,  dbCol: "LIC",         title: "विमा - LIC" },
  { row: 3, col: 10, dbCol: "SARV_BAND_PAT", title: "सर्व. बँक. पतपेढी" },

  { row: 4, col: 1,  dbCol: "DUTY",          title: "कर्तव्य भत्ता" },
  { row: 4, col: 3,  dbCol: "DEDUCTION_AMT", title: "कपात रक्कम" },
  { row: 4, col: 4,  dbCol: "A_NU_SHULK",    title: "अनुज्ञाप्ती शुल्क" },
  { row: 4, col: 5,  dbCol: "MAHATMA_PHULE", title: "महात्मा फुले" },
  { row: 4, col: 6,  dbCol: "OTHER_DED",     title: "इतर कपात" },
  { row: 4, col: 7,  dbCol: "ANSH_NI_VETAN", title: "अंशदान नि. वेतन" },
  { row: 4, col: 8,  dbCol: "VAHAN_KARJ",    title: "वाहन कर्ज" },
  { row: 4, col: 9,  dbCol: "MANAPA_PAT",    title: "म.न.पा. पतपेढी" },
  { row: 4, col: 10, dbCol: "SARVBANDPAT", title: "सार्व. बांध पतपेढी" },

  { row: 5, col: 4,  dbCol: "ETAR_NIDHI",   title: "इतर / निधी" },
  { row: 5, col: 5,  dbCol: "FEST_ALLOW",   title: "उत्सव भत्ता" },
  { row: 5, col: 6,  dbCol: "A_NI_VETAN10", title: "अंशदान नि. वेतन १०%" },
  { row: 5, col: 7,  dbCol: "FEST_LOAN",    title: "सणाचे कर्ज" },
  { row: 5, col: 9,  dbCol: "B_NI_NIDHI",   title: "भविष्य नि. निधी" },
  { row: 5, col: 10, dbCol: "OBC_MANDAL",   title: "ओ.बी.सी. मंडळ" },
];

function buildHeaderGrid() {
  const rows = { row1: [], row2: [], row3: [], row4: [], row5: [] };
  for (let r = 1; r <= 5; r++) {
    const rowArr = [];
    for (let c = 1; c <= 12; c++) {
      const match = PAYHEAD_MAP.find((p) => p.row === r && p.col === c);
      rowArr.push({
        key: match ? `${r}-${c}` : null,
        title: match ? match.title : "",
      });
    }
    rows[`row${r}`] = rowArr;
  }
  return rows;
}

function buildEmployeesFromPayheads(payheadRows) {
  return (payheadRows || []).map((rec, idx) => {
    const desigName   = rec.VAR_DESIGMST_DESIGNATIONNAME || "";
    const presentDays = Number(rec.PRESENTDAYS || rec.WORKINGDAYS || 30);
    const totalEarning   = Number(rec.TOTALEARN   || 0);
    const totalDeduction = Number(rec.TOTALDEDUCT || 0);
    const netPay         = Number(rec.NETPAY || (totalEarning - totalDeduction));

    const colValues = {};
    for (let i = 1; i <= 60; i++) colValues[`col${i}`] = "";

    PAYHEAD_MAP.forEach((p) => {
      if (!p.dbCol) return;
      const flatIdx = (p.row - 1) * 12 + p.col;
      const val = rec[p.dbCol];
      colValues[`col${flatIdx}`] = val === undefined || val === null ? 0 : val;
    });

    return {
      empCode:      String(idx + 1).padStart(3, "0"),
      marathiName:  desigName,
      panNo:        "-",
      gpfPranNo:    "-",
      presentDays:  presentDays,
      leaveDays:    0,
      designation:  desigName,
      ...colValues,
      totalEarning,
      totalDeduction,
      netPay,
      row1Cols: Array.from({ length: 12 }, (_, i) => ({ key: 0 * 12 + i + 1 })),
      row2Cols: Array.from({ length: 12 }, (_, i) => ({ key: 1 * 12 + i + 1 })),
      row3Cols: Array.from({ length: 12 }, (_, i) => ({ key: 2 * 12 + i + 1 })),
      row4Cols: Array.from({ length: 12 }, (_, i) => ({ key: 3 * 12 + i + 1 })),
      row5Cols: Array.from({ length: 12 }, (_, i) => ({ key: 4 * 12 + i + 1 })),
    };
  });
}

const generateBillDmcPDF = async ({
  billDetailRows = [],
  netEarning = 0,
  subDetailRows = [],
  payheadRows = [],
  departmentName = "",
  genderText = "",
  monthName = "",
  yearName = "",
  lstdate = "",
  deptId = "",
  corporationName = "",
  logo = "",
}) => {
  let browser;

  try {
    const templatePath = path.resolve(
      __dirname,
      "../../templates/FrmBillDmcTeriz.html"
    );
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }
    const templateHtml = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(templateHtml);

    let finalLogo = logo;
    if (!finalLogo) {
      const logoPath = path.resolve(__dirname, "../../assets/NMC_Logo.jpeg");
      if (fs.existsSync(logoPath)) {
        finalLogo = imageToBase64(logoPath);
      }
    }

    const headerGrid = buildHeaderGrid();
    const employees  = buildEmployeesFromPayheads(payheadRows);

    const reportTotals = {};
    for (let i = 1; i <= 60; i++) {
      reportTotals[`rTotal${i}`] = employees.reduce(
        (s, e) => s + Number(e[`col${i}`] || 0),
        0
      );
    }

    const grandTotalEarning = employees.reduce(
      (s, e) => s + Number(e.totalEarning || 0),
      0
    );
    const grandTotalDeduction = employees.reduce(
      (s, e) => s + Number(e.totalDeduction || 0),
      0
    );
    const grandNetPay = grandTotalEarning - grandTotalDeduction;

    console.log("grandNetPay: ", grandNetPay);

    const isDept406 = String(deptId) === "406";
    const infoLine = isDept406
      ? `${departmentName} - कायम ${genderText} सफाई कामगार यांचे माहे - ${monthName} ${yearName} चे पगार बिल. + तेरीज पत्रक`
      : `तेरीज - ${departmentName}`;

    const templateData = {
      corporationName: corporationName || departmentName,
      corporationLogo: finalLogo,
      infoLine,
      departmentName,
      month: monthName,
      year: yearName,
      headerGrid,
      employees,
      reportTotals,
      grandTotalEarning,
      grandTotalDeduction,
      grandNetPay,
      amountInWords: "",
      row1Keys: Array.from({ length: 12 }, (_, i) => ({ key: i + 1 })),
      row2Keys: Array.from({ length: 12 }, (_, i) => ({ key: 12 + i + 1 })),
      row3Keys: Array.from({ length: 12 }, (_, i) => ({ key: 24 + i + 1 })),
      row4Keys: Array.from({ length: 12 }, (_, i) => ({ key: 36 + i + 1 })),
      row5Keys: Array.from({ length: 12 }, (_, i) => ({ key: 48 + i + 1 })),
    };

    const html = template(templateData);

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

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    const pdfBuffer = await page.pdf({
      format: "A3",
      landscape: true,
      printBackground: true,
      margin: { top: "4mm", bottom: "4mm", left: "4mm", right: "4mm" },
      preferCSSPageSize: true,
    });

    await browser.close();
    browser = null;

    const outputDir = path.resolve(__dirname, "../../../public/pdf");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const fileName = `Bill_DMC_${Date.now()}.pdf`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    return { fileName, filePath };
  } catch (error) {
    if (browser) await browser.close();
    console.error("Bill DMC PDF Generation Error:", error);
    throw error;
  }
};

module.exports = { generateBillDmcPDF };