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
  if (value === undefined || value === null || value === "") return "0";
  const num = Number(value);
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-IN");
});

Handlebars.registerHelper("inc", function (value) {
  return parseInt(value) + 1;
});

Handlebars.registerHelper("eq", function (a, b) {
  return String(a) === String(b);
});

const generateBillDmcPDF2 = async ({
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
      "../../templates/FrmBillDmcTeriz2.html",
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

    const kharchacheKarti = [];
    billDetailRows.forEach((row) => {
      if (row.Deduction_Head) {
        kharchacheKarti.push({
          label: row.Deduction_Head,
          amount: Number(row.Deduction_Amount || 0),
        });
      }
    });

    const jamacheKarti = [];
    billDetailRows.forEach((row) => {
      if (row.Earning_Head) {
        jamacheKarti.push({
          label: row.Earning_Head,
          amount: Number(row.Earning_Amount || 0),
        });
      }
    });

    const totalJama = jamacheKarti.Earning_Amount;

    const staffRows = subDetailRows.map((s, idx) => {
      const match = payheadRows.find(
        (p) =>
          (p.VAR_DESIGMST_DESIGNATIONNAME || "").trim() ===
          (s.DESIGNATION || "").trim(),
      );

      const approved = Number(s.POST || 0) || Number(match?.POST || 0) || 0;
      const newCreated = Number(s.NEWJOINED || 0);
      const totalPosts = approved + newCreated;
      const working = Number(s.WORKING || 0);
      const vacant = Number(s.RIKT || 0);

      return {
        srNo: idx + 1,
        designation: s.DESIGNATION || match?.VAR_DESIGMST_DESIGNATIONNAME || "",
        approved,
        newCreated,
        totalPosts,
        working,
        vacant,
      };
    });

    if (staffRows.length === 0 && payheadRows.length > 0) {
      payheadRows.forEach((p, idx) => {
        staffRows.push({
          srNo: idx + 1,
          designation: p.VAR_DESIGMST_DESIGNATIONNAME || "",
          approved: Number(p.POST || 0),
          newCreated: 0,
          totalPosts: Number(p.POST || 0),
          working: Number(p.WORKING || 0),
          vacant: Number(p.POST || 0) - Number(p.WORKING || 0),
        });
      });
    }

    const staffTotals = staffRows.reduce(
      (acc, r) => {
        acc.approved += Number(r.approved || 0);
        acc.newCreated += Number(r.newCreated || 0);
        acc.totalPosts += Number(r.totalPosts || 0);
        acc.working += Number(r.working || 0);
        acc.vacant += Number(r.vacant || 0);
        return acc;
      },
      { approved: 0, newCreated: 0, totalPosts: 0, working: 0, vacant: 0 },
    );

    const isDept406 = String(deptId) === "406";
    const infoLine = `${departmentName} - कायम ${genderText} सफाई कामगार यांचे माहे - ${monthName} ${yearName} चे पगार बिल. + तेरीज पत्रक`;


    const amountInWords = numberToIndianWords(totalJama || netEarning || 0);

    function getFinancialYear(monthName, yearName) {
      if (!monthName || !yearName) return "";

      const monthMap = {
        jan: 0,
        january: 0,
        feb: 1,
        february: 1,
        mar: 2,
        march: 2,
        apr: 3,
        april: 3,
        may: 4,
        jun: 5,
        june: 5,
        jul: 6,
        july: 6,
        aug: 7,
        august: 7,
        sep: 8,
        september: 8,
        sept: 8,
        oct: 9,
        october: 9,
        nov: 10,
        november: 10,
        dec: 11,
        december: 11,
      };

      const key = String(monthName).trim().toLowerCase().slice(0, 3);
      const monthIdx = monthMap[key];
      if (monthIdx === undefined) return "";

      let yr = parseInt(String(yearName).replace(/\D/g, ""), 10);
      if (isNaN(yr)) return "";
      if (yr < 100) yr += 2000; 

      const startYear = monthIdx >= 3 ? yr : yr - 1;
      const endYear = startYear + 1;

      return `${startYear}-${endYear}`;
    }


    const financialYear = getFinancialYear(monthName, yearName);

    const templateData = {
      corporationName: corporationName || departmentName,
      corporationLogo: finalLogo,
      infoLine,
      departmentName,
      month: monthName,
      year: yearName,
      financialYear: financialYear,
      lstdate,
      deptId,

      kharchacheKarti,

      jamacheKarti,
      totalJama,

      staffRows,
      staffTotals,

      netEarning: Number(netEarning || 0),
      grandTotal: totalJama || netEarning || 0,
      amountInWords,
    };

    const html = template(templateData);

    const chromePath = path.resolve(
      __dirname,
      "../../../node_modules/puppeteer/.cache/puppeteer/chrome/win64-135.0.7049.84/chrome-win64/chrome.exe",
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

    const fileName = `Teriz_Patrak_${Date.now()}.pdf`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    return { fileName, filePath };
  } catch (error) {
    if (browser) await browser.close();
    console.error("Summary Report PDF Generation Error:", error);
    throw error;
  }
};

function numberToIndianWords(num) {
  const n = Math.floor(Number(num) || 0);
  if (n === 0) return "शून्य रुपये मात्र.";

  const ones = [
    "",
    "एक",
    "दोन",
    "तीन",
    "चार",
    "पाच",
    "सहा",
    "सात",
    "आठ",
    "नऊ",
    "दहा",
    "अकरा",
    "बारा",
    "तेरा",
    "चौदा",
    "पंधरा",
    "सोळा",
    "सतरा",
    "अठरा",
    "एकोणीस",
    "वीस",
    "एकवीस",
    "बावीस",
    "तेवीस",
    "चोवीस",
    "पंचवीस",
    "सव्वीस",
    "सत्तावीस",
    "अठ्ठावीस",
    "एकोणतीस",
    "तीस",
    "एकतीस",
    "बत्तीस",
    "तेहतीस",
    "चौतीस",
    "पस्तीस",
    "छत्तीस",
    "सदतीस",
    "अडतीस",
    "एकोणचाळीस",
    "चाळीस",
    "एक्केचाळीस",
    "बेचाळीस",
    "त्रेचाळीस",
    "चव्वेचाळीस",
    "पंचेचाळीस",
    "सेहेचाळीस",
    "सत्तेचाळीस",
    "अठ्ठेचाळीस",
    "एकोणपन्नास",
    "पन्नास",
    "एक्कावन्न",
    "बावन्न",
    "त्रेपन्न",
    "चोपन्न",
    "पंचावन्न",
    "छप्पन्न",
    "सत्तावन्न",
    "अठ्ठावन्न",
    "एकोणसाठ",
    "साठ",
    "एकसष्ट",
    "बासष्ट",
    "त्रेसष्ट",
    "चौसष्ट",
    "पासष्ट",
    "सहासष्ट",
    "सदुसष्ट",
    "अडुसष्ट",
    "एकोणसत्तर",
    "सत्तर",
    "एक्काहत्तर",
    "बाहत्तर",
    "त्र्याहत्तर",
    "चौर्याहत्तर",
    "पंच्याहत्तर",
    "शहात्तर",
    "सत्याहत्तर",
    "अठ्ठ्याहत्तर",
    "एकोणऐंशी",
    "ऐंशी",
    "एक्क्याऐंशी",
    "ब्याऐंशी",
    "त्र्याऐंशी",
    "चौऱ्याऐंशी",
    "पंच्याऐंशी",
    "शहाऐंशी",
    "सत्याऐंशी",
    "अठ्ठ्याऐंशी",
    "एकोणनव्वद",
    "नव्वद",
    "एक्क्याण्णव",
    "ब्याण्णव",
    "त्र्याण्णव",
    "चौऱ्याण्णव",
    "पंच्याण्णव",
    "शहाण्णव",
    "सत्याण्णव",
    "अठ्ठ्याण्णव",
    "नव्याण्णव",
  ];

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const rest = n % 100;

  let result = "";
  if (crore) result += ones[crore] + " कोटी ";
  if (lakh) result += ones[lakh] + " लाख ";
  if (thousand) result += ones[thousand] + " हजार ";
  if (hundred) result += ones[hundred] + "शे ";
  if (rest) result += ones[rest] + " ";

  return result.trim() + " रुपये मात्र.";
}

module.exports = { generateBillDmcPDF2 };
