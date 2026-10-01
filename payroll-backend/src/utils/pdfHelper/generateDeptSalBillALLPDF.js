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
  return isNaN(num) ? "" : num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
});

Handlebars.registerHelper("getTotalValue", function (totals, colNo) {
  if (!totals || !colNo) return "";
  const val = totals[`rTotal${colNo}`] !== undefined ? totals[`rTotal${colNo}`] : totals[`col${colNo}`];
  if (val === undefined || val === null || val === "") return "";
  const num = Number(val);
  return isNaN(num) ? "" : num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
});

const generateDeptSalBillALLPDF = async ({
  reportData,
  reportType = "EARN",
  salaryDate: rawSalaryDate,
  corporationName = "",
  logo,
  month = "",
  year = "",
  department = "",
  category = "",
  zone = "",
  departmentName = "",
  ulbId = "",
}) => {
  let browser;

  try {
    let templateFileName;
    if (ulbId === "4") {
      templateFileName = "FrmDepSalBillDMC.html";
    } else {
      templateFileName = reportType === "EARN"
        ? "FrmDepSalBillEarning.html"
        : "FrmDepSalBillDeduction.html";
    }

    const templatePath = path.resolve(__dirname, "../../templates", templateFileName);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const templateHtml = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(templateHtml);

    let finalLogo = logo;
    if (!finalLogo) {
      const logoPath = path.resolve(__dirname, "../../assets/NMC_Logo.jpeg");
      finalLogo = fs.existsSync(logoPath) ? imageToBase64(logoPath) : "";
    }

    const row1Config = [
      { key: 1,   defaultTitle: "मूळ वेतन" },
      { key: null, defaultTitle: "" },
      { key: 3,   defaultTitle: "घरभाडे भत्ता" },
      { key: null, defaultTitle: "" },
      { key: 17,  defaultTitle: "भ. नि. वर्गणी / कर्ज हप्ता" },
      { key: 18,  defaultTitle: "इतर १" },
      { key: 31,  defaultTitle: "प्रा.फंड.कर्ज" }, 
      { key: 109, defaultTitle: "अंशदान निधी 14 % मनपा" }, 
      { key: 103, defaultTitle: "वसुली" }, 
      { key: null, defaultTitle: "" },
      { key: 26,  defaultTitle: "विमा - LIC" },     
      { key: null, defaultTitle: "" },
    ];

    const row2Config = [
      { key: 123, defaultTitle: "इतर भत्ता" }, 
      { key: 2,   defaultTitle: "महागाई भत्ता" },
      { key: 111, defaultTitle: "धुलाई भत्ता" }, 
      { key: 16,  defaultTitle: "इतर / दंड" },
      { key: 29,  defaultTitle: "पोस्ट" },  
      { key: 30,  defaultTitle: "बँक कर्ज" }, 
      { key: 108, defaultTitle: "व्यवसाय कर" }, 
      { key: null, defaultTitle: "" },
      { key: 22,  defaultTitle: "इतर बँक हप्ता" }, 
      { key: 15,  defaultTitle: "ध्वजनिधी" },  
      { key: 13,  defaultTitle: "आयकर" },      
      { key: null, defaultTitle: "" },
    ];

    const row3Config = [
      { key: 107, defaultTitle: "वाहन भत्ता" },  
      { key: 8,   defaultTitle: "ग्रेड वेतन" },    
      { key: 10,  defaultTitle: "मनपा हिस्सा १४%" },  
      { key: 28,  defaultTitle: "कामगार सोसायटी" }, 
      { key: 106, defaultTitle: "ग. स.बँक" },  
      { key: 25,  defaultTitle: "इतर पतपेढी" }, 
      { key: 14,  defaultTitle: "अपघात विमा" },  
      { key: 23,  defaultTitle: "भविष्य नि. निधी" },  
      { key: 102, defaultTitle: "एल.आय.सी." },  
      { key: 12,  defaultTitle: "सार्व. बांध पतपेढी" }, 
      { key: 27,  defaultTitle: "इतर / निधी" },  
      { key: null, defaultTitle: "" },
    ];

    const row4Config = [
      { key: 121, defaultTitle: "कर्तव्य भत्ता" },
      { key: null, defaultTitle: "" },
      { key: 9,   defaultTitle: "कपात रक्कम वजा" },  
      { key: 105, defaultTitle: "अनुज्ञाप्ती शुल्क" },
      { key: 112, defaultTitle: "महात्मा फुले" },
      { key: 19,  defaultTitle: "अंशदान नि. वेतन १०%" },
      { key: 20,  defaultTitle: "अंशदान नि. वेतन" }, 
      { key: 101, defaultTitle: "वाहन कर्ज" }, 
      { key: 11,  defaultTitle: "मनपा पतपेढी / वर्गणी" },
      { key: 24,  defaultTitle: "सार्व. बांध. पतपेढी" },
      { key: 104, defaultTitle: "इतर कपात" },
      { key: null, defaultTitle: "" },
    ];

    const row5Config = [
      { key: 4,   defaultTitle: "हजर दिवसांचा Basic" },
      { key: 5,   defaultTitle: "वैद्यकीय भत्ता" },
      { key: null, defaultTitle: "" },
      { key: 122, defaultTitle: "उत्सव भत्ता" },
      { key: null, defaultTitle: "" },
      { key: null, defaultTitle: "" },
      { key: 32,  defaultTitle: "सणाचे कर्ज" },
      { key: null, defaultTitle: "" },
      { key: null, defaultTitle: "" },
      { key: 113, defaultTitle: "ओ.बी.सी. मंडळ" },
      { key: null, defaultTitle: "" },
      { key: null, defaultTitle: "" },
    ];

    const mapHeaderGridRow = (rowConfig) =>
      rowConfig.map((item) => {
        if (!item.key) return { key: null, title: item.defaultTitle };
        const dbTitle = reportData.headers?.[`header${item.key}`];
        return { key: item.key, title: dbTitle || item.defaultTitle };
      });

    const headerGrid = {
      row1: mapHeaderGridRow(row1Config),
      row2: mapHeaderGridRow(row2Config),
      row3: mapHeaderGridRow(row3Config),
      row4: mapHeaderGridRow(row4Config),
      row5: mapHeaderGridRow(row5Config),
    };

    let totalDaysInMonth;
    const standardizedDateStr = rawSalaryDate ? rawSalaryDate.replace(/-/g, " ") : "";
    const salaryDateObj = new Date(standardizedDateStr);

    if (!isNaN(salaryDateObj.getTime())) {
      totalDaysInMonth = new Date(salaryDateObj.getFullYear(), salaryDateObj.getMonth() + 1, 0).getDate();
    } else {
      const today = new Date();
      totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    }

    const processedEmployees = (reportData.employees || []).map((emp) => {
      const presentDays = Number(emp.presentdays || 0);
      const empCode = emp.num_employee_empid || emp.NUM_EMPLOYEE_EMPID || "";
      return {
        ...emp,
        empCode: String(empCode).padStart(5, "0"),
        marathiName: emp.VAR_EMPLOYEE_MARNAME || emp.var_employee_marname || "",
        designation: emp.Designation || emp.designation || "",
        panNo: emp.VAR_PAN_NO || emp.var_pan_no || "-",
        gpfPranNo: emp.VAR_PRAN_NO || emp.var_pran_no || "-",
        presentDays: presentDays,
        leaveDays: totalDaysInMonth - presentDays,
        // totalEarning: Number(emp.totalEarning || emp.Total || 0),
        // totalDeduction: Number(emp.totalDeduction || emp.DTotal || 0),
        // netPay: Number(emp.TotalPayamount || emp.netPay || 0),
        totalEarning: Number(emp.dbTotalEarning || emp.Total || 0),
        totalDeduction: Number(emp.dbTotalDeduction || emp.DTotal || 0),
        netPay: Number(emp.dbTotalEarning || emp.Total || 0) - Number(emp.dbTotalDeduction || emp.DTotal || 0),

        row1Cols: row1Config.map((item) => ({ key: item.key })),
        row2Cols: row2Config.map((item) => ({ key: item.key })),
        row3Cols: row3Config.map((item) => ({ key: item.key })),
        row4Cols: row4Config.map((item) => ({ key: item.key })),
        row5Cols: row5Config.map((item) => ({ key: item.key })),
      };
    });

    const reportTotals = reportData.reportTotals || {};
    // const grandTotalEarning = reportData.grandTotalEarning || processedEmployees.reduce((sum, emp) => sum + emp.totalEarning, 0);
    // const grandTotalDeduction = reportData.grandTotalDeduction || processedEmployees.reduce((sum, emp) => sum + emp.totalDeduction, 0);
    // const grandNetPay = reportData.grandNetPay || processedEmployees.reduce((sum, emp) => sum + emp.netPay, 0);
    const grandTotalEarning = processedEmployees.reduce((sum, emp) => sum + Number(emp.dbTotalEarning || emp.Total || 0), 0);
    const grandTotalDeduction = processedEmployees.reduce((sum, emp) => sum + Number(emp.dbTotalDeduction || emp.DTotal || 0), 0);
    const grandNetPay = grandTotalEarning - grandTotalDeduction;

    const templateData = {
      corporationName: corporationName || "धुळे महानगरपालिका",
      corporationLogo: finalLogo,
      departmentName: departmentName || department || "(एलबीटी)- जकात विभाग",
      month: month || "January",
      year: year || "2024",
      zone: zone || "Head Office",
      category: category || "All Category",
      headerGrid,
      employees: processedEmployees,
      reportTotals,
      grandTotalEarning,
      grandTotalDeduction,
      grandNetPay,
      amountInWords: reportData.amountInWords || "",
      row1Keys: row1Config,
      row2Keys: row2Config,
      row3Keys: row3Config,
      row4Keys: row4Config,
      row5Keys: row5Config,
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
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 60000 });

    const pdfBuffer = await page.pdf({
      format: "A3",
      landscape: true,
      printBackground: true,
      margin: { top: "4mm", bottom: "4mm", left: "4mm", right: "4mm" },
      preferCSSPageSize: true,
    });

    await browser.close();

    const outputDir = path.resolve(__dirname, "../../../public/pdf");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `DeptSalaryBill_DMC_${Date.now()}.pdf`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    return { fileName, filePath };
  } catch (error) {
    if (browser) await browser.close();
    console.error("PDF Generation Error:", error);
    throw error;
  }
};

module.exports = { generateDeptSalBillALLPDF };