const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

// (Later we will replace this with Marathi amount in words)
const amountInWords = (amount) => {
  return Number(amount || 0).toLocaleString("en-IN");
};

const PaySlipPDFHelper = async ({ reportType, employees, leaveDetails = [], ulbInfo, month, year }) => {
  //--------------------------------------------------
  // Template
  //--------------------------------------------------

  const templatePath = path.resolve(__dirname, "../../templates/FrmPaySlip.html");

  const htmlFile = fs.readFileSync(templatePath, "utf8");

  const template = Handlebars.compile(htmlFile);

  const amountInWords = (amount) => {
    const units = [
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
      "तेहेतीस",
      "चौतीस",
      "पस्तीस",
      "छत्तीस",
      "सदतीस",
      "अडतीस",
      "एकोणचाळीस",
      "चाळीस",
      "एकेचाळीस",
      "बेचाळीस",
      "त्रेचाळीस",
      "चव्वेचाळीस",
      "पंचेचाळीस",
      "सेहेचाळीस",
      "सत्तेचाळीस",
      "अठ्ठेचाळीस",
      "एकोणपन्नास",
      "पन्नास",
      "एकावन्न",
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
      "सत्तेसष्ट",
      "अडुसष्ट",
      "एकोणसत्तर",
      "सत्तर",
      "एकाहत्तर",
      "बहात्तर",
      "त्र्याहत्तर",
      "चौर्‍याहत्तर",
      "पंच्याहत्तर",
      "शहात्तर",
      "सत्त्याहत्तर",
      "अठ्ठ्याहत्तर",
      "एकोणऐंशी",
      "ऐंशी",
      "एक्याऐंशी",
      "ब्याऐंशी",
      "त्र्याऐंशी",
      "चौर्‍याऐंशी",
      "पंच्याऐंशी",
      "शहाऐंशी",
      "सत्त्याऐंशी",
      "अठ्ठ्याऐंशी",
      "एकोणनव्वद",
      "नव्वद",
      "एक्याण्णव",
      "ब्याण्णव",
      "त्र्याण्णव",
      "चौर्‍याण्णव",
      "पंच्याण्णव",
      "शहाण्णव",
      "सत्त्याण्णव",
      "अठ्ठ्याण्णव",
      "नव्व्याण्णव",
      "शंभर",
    ];

    const getWords = (n) => {
      if (n === 0) return "";

      if (n <= 100) return units[n];

      if (n < 1000) {
        const hundred = Math.floor(n / 100);
        const rem = n % 100;

        let str = hundred === 1 ? "शंभर" : units[hundred] + "शे";

        if (rem > 0) str += " " + getWords(rem);

        return str;
      }

      if (n < 100000) {
        const thousand = Math.floor(n / 1000);
        const rem = n % 1000;

        let str = getWords(thousand) + " हजार";

        if (rem > 0) str += " " + getWords(rem);

        return str;
      }

      if (n < 10000000) {
        const lakh = Math.floor(n / 100000);
        const rem = n % 100000;

        let str = getWords(lakh) + " लाख";

        if (rem > 0) str += " " + getWords(rem);

        return str;
      }

      const crore = Math.floor(n / 10000000);
      const rem = n % 10000000;

      let str = getWords(crore) + " कोटी";

      if (rem > 0) str += " " + getWords(rem);

      return str;
    };

    amount = Number(amount || 0);

    if (amount === 0) return "शून्य रुपये फक्त";

    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    let result = getWords(rupees) + " रुपये";

    if (paise > 0) result += " " + getWords(paise) + " पैसे";

    result += " फक्त";

    return result;
  };

  //--------------------------------------------------
  // Month Name
  //--------------------------------------------------

  const monthNames = ["जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"];

  const monthText = `${monthNames[Number(month) - 1]}-${year}`;
  console.log("monthText", monthText);

  //--------------------------------------------------
  // Prepare Employees
  //--------------------------------------------------

  const employeeData = employees.map((emp, index) => {
    //--------------------------------------------------
    // Equal Rows
    //--------------------------------------------------

    const maxRows = Math.max(emp.earnings.length, emp.deductions.length);

    const earnings = [...emp.earnings];
    const deductions = [...emp.deductions];

    while (earnings.length < maxRows) {
      earnings.push({
        head: "",
        amount: "",
      });
    }

    while (deductions.length < maxRows) {
      deductions.push({
        head: "",
        amount: "",
      });
    }

    //--------------------------------------------------
    // Merge Both Columns
    //--------------------------------------------------

    const salaryRows = [];

    for (let i = 0; i < maxRows; i++) {
      salaryRows.push({
        earningHead: earnings[i].head,

        earningAmount:
          earnings[i].amount === ""
            ? ""
            : Number(earnings[i].amount).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              }),

        deductionHead: deductions[i].head,

        deductionAmount:
          deductions[i].amount === ""
            ? ""
            : Number(deductions[i].amount).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              }),
      });
    }

    //--------------------------------------------------
    // Leave Details
    //--------------------------------------------------

    const empLeaves = leaveDetails.filter((x) => Number(x.EMPID) === Number(emp.EmpId));



    const leaveSummary = {
      medicalleave: Number(emp.medicalleave || 0),
      earnedleave: Number(emp.earnedleave || 0),
      halfday: Number(emp.halfday || 0),
      withoutpay: Number(emp.withoutpay || 0),
    };

    console.log("leaveSummary", leaveSummary);
    
    empLeaves.forEach((x) => {
      const days = Number(x.LEAVE_DAYS_IN_MONTH || 0);

      switch ((x.LEAVENAME || "").trim()) {
        case "वैद्यकीय रजा":
          leaveSummary.medicalleave += days;
          break;

        case "अर्जित रजा":
          leaveSummary.earnedleave += days;
          break;

        case "अर्ध वेतनाची रजा":
          leaveSummary.halfday += days;
          break;

        case "बिनवेतनी रजा":
          leaveSummary.withoutpay += days;
          break;
      }
    });
    //--------------------------------------------------
    // Return Employee
    //--------------------------------------------------

    return {
      srNo: index + 1,

      monthText,

      ...emp,

      salaryRows,

      leaveRows: empLeaves,

      grossSalary: Number(emp.grossSalary || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      }),

      totalDeduction: Number(emp.totalDeduction || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      }),

      netSalary: Number(emp.netSalary || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      }),

      basicSalary: Number(emp.num_salary_basic || 0).toLocaleString("en-IN"),

      gradePay: Number(emp.num_salary_gradepay || 0).toLocaleString("en-IN"),

      amountInWords: amountInWords(emp.netSalary),

      printDate: new Date().toLocaleDateString("en-GB"),

      hasLeaveDetails: leaveSummary.medicalleave > 0 || leaveSummary.earnedleave > 0 || leaveSummary.halfday > 0 || leaveSummary.withoutpay > 0,
    };
  });
  //--------------------------------------------------
  // Generate HTML
  //--------------------------------------------------

  const html = template({
    logo: ulbInfo.ULBLOGO || "",

    corporationName: ulbInfo.ABC_MUNICIPAL_TEXT || "",

    officeName: ulbInfo.OFFICE_NAME || "",

    monthText,

    employees: employeeData,

    reportType,
  });

  //--------------------------------------------------
  // Chrome Path
  //--------------------------------------------------

  const chromePath = path.resolve(__dirname, "../../../node_modules/puppeteer/.cache/puppeteer/chrome/win64-135.0.7049.84/chrome-win64/chrome.exe");

  const launchOptions = {
    headless: true,

    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };

  if (fs.existsSync(chromePath)) {
    launchOptions.executablePath = chromePath;
  }

  //--------------------------------------------------
  // Launch Browser
  //--------------------------------------------------

  const browser = await puppeteer.launch(launchOptions);

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0",

    timeout: 0,
  });

  //--------------------------------------------------
  // PDF
  //--------------------------------------------------

  const pdfBuffer = await page.pdf({
    format: "A4",

    landscape: true,

    printBackground: true,

    margin: {
      top: "8mm",
      right: "8mm",
      bottom: "8mm",
      left: "8mm",
    },
  });

  await browser.close();

  //--------------------------------------------------
  // Output Folder
  //--------------------------------------------------

  const outputDir = path.resolve(__dirname, "../../../public/pdf");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {
      recursive: true,
    });
  }

  //--------------------------------------------------
  // Save PDF
  //--------------------------------------------------

  const fileName = `PaySlip_${Date.now()}.pdf`;

  const filePath = path.join(outputDir, fileName);

  fs.writeFileSync(filePath, pdfBuffer);

  //--------------------------------------------------
  // Return
  //--------------------------------------------------

  return {
    fileName,

    filePath,
  };
};

module.exports = {
  PaySlipPDFHelper,
};
