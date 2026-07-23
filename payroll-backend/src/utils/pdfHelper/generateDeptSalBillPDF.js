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
  return Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
});

Handlebars.registerHelper("formatCurrency", function (value) {
  return Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
});

Handlebars.registerHelper("inc", function (value) {
  return Number(value) + 1;
});

Handlebars.registerHelper("getColValue", function (employee, colNo) {
  const val = employee[`col${colNo}`] || 0;
  return Number(val).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
});

Handlebars.registerHelper("getTotalValue", function (totals, colNo) {
  if (!totals) return "0";
  const val = totals[`rTotal${colNo}`] || 0;
  return Number(val).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
});

Handlebars.registerHelper("sumEmployees", function (employees, field) {
  if (!employees || !Array.isArray(employees)) return 0;
  return employees.reduce((sum, emp) => sum + (Number(emp[field]) || 0), 0);
});

Handlebars.registerHelper("add", function (a, b) {
  return (Number(a) || 0) + (Number(b) || 0);
});

Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

Handlebars.registerHelper("neq", function (a, b) {
  return a !== b;
});

Handlebars.registerHelper("and", function () {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  return args.every(Boolean);
});

Handlebars.registerHelper("or", function () {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  return args.some(Boolean);
});


const generateDeptSalBillPDF = async ({ 
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
}) => {
  let browser;

  try {
    const templateFileName = reportType === "EARN" ? "FrmDepSalBillEarning.html" : "FrmDepSalBillDeduction.html";
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

    const reportTotals = reportData.reportTotals || {};

    const headers = [];

    if (reportType === "EARN") {
      const earningColumns = [
        { key: 1, title: "मूळ वेतन" },
        { key: 2, title: "महागाई भत्ता" },
        { key: 3, title: "घरभाडे" },
        { key: 109, title: "वाहन भत्ता" }, 
        { key: 102, title: "मनपा डि.सी.पी.एस." },
        { key: 12, title: "धुलाई भत्ता" }, 
        { key: 7, title: "टायपिंग भत्ता" },
        { key: 110, title: "सफाई भत्ता" },
        { key: 103, title: "इतर भत्ते" },
      ];
      
      earningColumns.forEach((col) => {
        const dbHeader = reportData.headers?.[`header${col.key}`];
        if (dbHeader) {
          col.title = dbHeader;
        }
        headers.push(col);
      });

    } else {
      const deductionColumns = [
        { key: 126, title: "भ.नि.निधी" },          
        { key: 127, title: "भ.नि.नि.परतावा (PF)" },     
        { key: 131, title: "व्यवसाय कर" },           
        { key: 132, title: "आयकर (IT)" },            
        { key: 20, title: "सोसायटी १" },            
        { key: 17, title: "सोसायटी २" },             
        { key: 18, title: "सोसायटी ३" },            
        { key: 19, title: "सोसायटी ४" },             
        { key: 21, title: "बँक/ पतसंस्था" },                   
        { key: 106, title: "परत जमा" },              
        { key: 25, title: "गट विमा" },               
        { key: 28, title: "डि.सी.पी.एस 10%" },     
        { key: 27, title: "मनपा डि.सी.पी.एस" },     
        { key: 14, title: "मु. शुल्क" },             
        { key: 32, title: "घरभाडे वसली" },          
        { key: 29, title: "पाणीपट्टी" },             
        { key: 105, title: "सण ॲडव्हान्स" },         
        { key: 11, title: "इतर कपात" },              
      ];
      
      const secondaryColumns = [
        { key: 10, title: "टिडीएस" },              
        { key: 22, title: "तसलमात" },                
        { key: 30, title: "जे.एम.एफ.सी." },          
        { key: 108, title: "घरभाडे अनु. शुल्क" },   
        { key: 107, title: "घरपट्टी" },          
        { key: 24, title: "विशेष निधी" },
      ];
      
      deductionColumns.forEach((col) => {
        const dbHeader = reportData.headers?.[`header${col.key}`];
        headers.push({
          key: col.key,
          title: dbHeader || col.title,
          isSecondary: false
        });
      });
    }

    let totalDaysInMonth;
    const standardizedDateStr = rawSalaryDate ? rawSalaryDate.replace(/-/g, " ") : "";
    const salaryDateObj = new Date(standardizedDateStr);

    if (!isNaN(salaryDateObj.getTime())) {
      totalDaysInMonth = new Date(salaryDateObj.getFullYear(), salaryDateObj.getMonth() + 1, 0).getDate();
    } else {
      const today = new Date();
      totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    }

    const processedEmployees = (reportData.employees || []).map((emp, index) => {
      const presentDays = Number(emp.presentdays || 0);
      const empCode = emp.num_employee_empid || emp.NUM_EMPLOYEE_EMPID || "";
      return {
        ...emp,
        srNo: index + 1,
        // empCode: String(empCode).padStart(5, "0"),
        empCode: String(empCode),
        name: emp.VAR_EMPLOYEE_ENGNAME || emp.var_employee_engname || emp.VAR_EMPLOYEE_MARNAME || emp.var_employee_marname || "",
        marathiName: emp.VAR_EMPLOYEE_MARNAME || emp.var_employee_marname || "",
        designation: emp.Designation || emp.designation || "",
        presentDays: presentDays,
        totalDaysInMonth: totalDaysInMonth,
        leaveDays: totalDaysInMonth - presentDays,
        basicPay: Number(emp.EarnBasic || emp.earnbasic || 0),
        gradePay: Number(emp.GradePay || emp.gradepay || 0),
        totalEarning: Number(emp.Total || emp.total || 0),
        totalDeduction: Number(emp.DTotal || emp.dtotal || 0),
        netPay: Number(emp.TotalPayamount || emp.totalpayamount || 0),

        EL: Number(emp.EL || emp.el || 0),
        ML: Number(emp.ML || emp.ml || 0),
        CL: Number(emp.CL || emp.cl || 0),
        HPL: Number(emp.HPL || emp.hpl || 0),
        LWP: Number(emp.LWP || emp.lwp || 0),
      };
    });

    const grandTotalEarn = processedEmployees.reduce((sum, emp) => sum + emp.totalEarning, 0);
    const grandTotalDeduct = processedEmployees.reduce((sum, emp) => sum + emp.totalDeduction, 0);
    const grandNetPay = grandTotalEarn - grandTotalDeduct;

    const numberToMarathiWords = (num) => {
      const units = [
        "", "एक", "दोन", "तीन", "चार", "पाच", "सहा", "सात", "आठ", "नऊ",
        "दहा", "अकरा", "बारा", "तेरा", "चौदा", "पंधरा", "सोळा", "सतरा", "अठरा", "एकोणीस",
        "वीस", "एकवीस", "बावीस", "तेवीस", "चोवीस", "पंचवीस", "सव्वीस", "सत्तावीस", "अठ्ठावीस", "एकोणतीस",
        "तीस", "एकतीस", "बत्तीस", "तेहतीस", "चौतीस", "पस्तीस", "छत्तीस", "सदतीस", "अडतीस", "एकोणचाळीस",
        "चाळीस", "एक्केचाळीस", "बेचाळीस", "त्रेचाळीस", "चव्वेचाळीस", "पंचेचाळीस", "सेहेचाळीस", "सत्तेचाळीस", "अठ्ठेचाळीस", "एकोणपन्नास",
        "पन्नास", "एक्कावन्न", "बावन्न", "त्रेपन्न", "चोपन्न", "पंचावन्न", "छप्पन्न", "सत्तावन्न", "अठ्ठावन्न", "एकोणसाठ",
        "साठ", "एकसष्ट", "बासष्ट", "त्रेसष्ट", "चौसष्ट", "पासष्ट", "सहासष्ट", "सत्तेसष्ट", "अडुसष्ट", "एकोणसत्तर",
        "सत्तर", "एकाहत्तर", "बहात्तर", "त्र्याहत्तर", "चौर्याहत्तर", "पंच्याहत्तर", "शहात्तर", "सत्त्याहत्तर", "अठ्ठ्याहत्तर", "एकोणऐंशी",
        "ऐंशी", "एक्याऐंशी", "ब्याऐंशी", "त्र्याऐंशी", "चौर्याऐंशी", "पंच्याऐंशी", "शहाऐंशी", "सत्त्याऐंशी", "अठ्ठ्याऐंशी", "एकोणनव्वद",
        "नव्वद", "एक्याण्णव", "ब्याण्णव", "त्र्याण्णव", "चौर्याण्णव", "पंच्याण्णव", "शहाण्णव", "सत्त्याण्णव", "अठ्ठ्याण्णव", "नव्व्याण्णव",
        "शंभर"
      ];

      const getWords = (n) => {
        if (n === 0) return "";
        if (n <= 100) return units[n];
        if (n < 1000) {
          const rem = n % 100;
          return units[Math.floor(n / 100)] + "शे " + (rem === 100 ? "" : getWords(rem));
        }
        if (n < 100000) {
          return getWords(Math.floor(n / 1000)) + " हजार " + getWords(n % 1000);
        }
        if (n < 10000000) {
          return getWords(Math.floor(n / 100000)) + " लाख " + getWords(n % 100000);
        }
        return getWords(Math.floor(n / 10000000)) + " कोटी " + getWords(n % 10000000);
      };

      const cleanNum = typeof num === "string" ? parseFloat(num.replace(/,/g, "")) : num;
      if (!cleanNum || cleanNum === 0 || isNaN(cleanNum)) return "शून्य रुपये";
      return getWords(Math.floor(cleanNum)).trim().replace(/\s+/g, " ") + " रुपये";
    };

    const templateData = {
      corporationName: corporationName || "सांगली, मिरज आणि कुपवाड शहर महानगरपालिका",
      corporationLogo: finalLogo,
      reportTitle: reportType === "EARN" ? "वेतन पत्रक - मिळकत तपशील" : "वेतन पत्रक - कटौती",
      departmentName: departmentName || department || "सर्व विभाग",
      month: month || "",
      year: year || "",
      monthName: month || "",
      zone: zone || "",
      category: category || "",
      headers: headers,
      employees: processedEmployees,
      totalEmployees: processedEmployees.length,
      grandTotalEarn: grandTotalEarn,
      grandTotalDeduct: grandTotalDeduct,
      grandNetPay: grandNetPay,
      grandNetInWords: numberToMarathiWords(grandNetPay),
      generatedDate: new Date().toLocaleDateString("en-GB"),
      reportTotals: reportTotals,  
      reportType: reportType,    
    };

    console.log("DEBUG TEMPLATE DATA:", {
      reportType,
      totalEmployees: processedEmployees.length,
      grandTotalEarn,
      grandTotalDeduct,
      grandNetPay,
      hasReportTotals: !!reportTotals,
      reportTotalsKeys: Object.keys(reportTotals).length,
      sampleTotals: {
        rTotal1: reportTotals.rTotal1,
        rTotal2: reportTotals.rTotal2,
        rTotal3: reportTotals.rTotal3,
      }
    });

    const html = template(templateData);

    // const browserOptions = {
    //   headless: "new",
    //   args: [
    //     "--no-sandbox",
    //     "--disable-setuid-sandbox",
    //     "--disable-dev-shm-usage",
    //     "--disable-gpu",
    //     "--disable-accelerated-2d-canvas",
    //     "--disable-accelerated-video-decode",
    //   ],
    // };

    // const possiblePaths = [
    //   "C:/Program Files/Google/Chrome/Application/chrome.exe",
    //   "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    //   "/usr/bin/google-chrome",
    //   "/usr/bin/chromium-browser",
    //   "/usr/bin/chromium",
    // ];

    // for (const chromePath of possiblePaths) {
    //   if (fs.existsSync(chromePath)) {
    //     browserOptions.executablePath = chromePath;
    //     break;
    //   }
    // }

    // browser = await puppeteer.launch(browserOptions);
    // const page = await browser.newPage();

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

    await page.setViewport({ width: 1280, height: 900 });

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    const pdfBuffer = await page.pdf({
      format: "A3",
      landscape: true,
      printBackground: true,
      margin: {
        top: "8mm",
        bottom: "8mm",
        left: "6mm",
        right: "6mm",
      },
      preferCSSPageSize: true,
    });

    await browser.close();

    // Save PDF
    const outputDir = path.resolve(__dirname, "../../../public/pdf");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `DeptSalaryBill_${reportType}_${Date.now()}.pdf`;
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, pdfBuffer);

    return {
      fileName,
      filePath,
    };
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error("PDF Generation Error:", error);
    throw error;
  }
};

module.exports = {
  generateDeptSalBillPDF,
};