const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

Handlebars.registerHelper("formatNumber", function (value) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
});

Handlebars.registerHelper("ne", function (a, b) {
  return a !== b;
});

function convertNumberToMarathiWords(number) {
  number = Math.round(Number(number || 0));
  if (number === 0) return "शून्य";
  if (number < 0) return "ऋण " + convertNumberToMarathiWords(Math.abs(number));

  const units = [
    "", "एक", "दोन", "तीन", "चार", "पाच", "सहा", "सात", "आठ", "नऊ", "दहा",
    "अकरा", "बारा", "तेरा", "चौदा", "पंधरा", "सोळा", "सतरा", "अठरा", "एकोणीस", "वीस",
    "एकवीस", "बावीस", "तेवीस", "चौवीस", "पंचवीस", "सव्वीस", "सत्तावीस", "अठ्ठावीस", "एकूणतीस", "तीस",
    "एकतीस", "बत्तीस", "तेत्तीस", "चौत्तीस", "पस्तीस", "छत्तीस", "सदतीस", "अडतीस", "एकूणचाळीस", "चाळीस",
    "एकचाळीस", "बेचाळीस", "त्रेशेचाळीस", "चौचाळीस", "पंचेचाळीस", "शीचेचाळीस", "सत्ताचाळीस", "अठ्ठाचाळीस", "एकूणपन्नास", "पन्नास",
    "एकपन्न", "बावन्न", "त्रेपन्न", "चौपन्न", "पन्नपन्न", "छप्पन्न", "सत्तावन", "अठ्ठावन", "एकूणसाठ", "साठ",
    "एकसष्ट", "पासष्ट", "त्रेसष्ट", "चौसष्ट", "पाचसष्ट", "सहसष्ट", "सतसष्ट", "अठसष्ट", "एकूणसत्तर", "सत्तर",
    "एकहत्तर", "बाहत्तर", "त्र्याहत्तर", "चौऱ्याहत्तर", "पंचहत्तर", "शहात्तर", "सतहत्तर", "अठ्ठ्याहत्तर", "एकूणऐंशी", "ऐंशी",
    "एक्याऐंशी", "ब्याऐंशी", "त्र्याऐंशी", "चौऱ्याऐंशी", "पंच्याऐंशी", "शहाऐंशी", "सत्ताऐंशी", "अठ्ठाऐंशी", "एकूणनव्वद", "नव्वद",
    "एक्यानव्वद", "ब्यानव्वद", "त्र्यानव्वद", "चौऱ्यानव्वद", "पंच्यानव्वद", "शहानव्वद", "सत्तानव्वद", "अठ्ठ्यानव्वद", "नव्व्याण्णव",
  ];

  let words = "";
  if (Math.floor(number / 10000000) > 0) {
    words += convertNumberToMarathiWords(Math.floor(number / 10000000)) + " कोटी ";
    number %= 10000000;
  }
  if (Math.floor(number / 100000) > 0) {
    words += convertNumberToMarathiWords(Math.floor(number / 100000)) + " लाख ";
    number %= 100000;
  }
  if (Math.floor(number / 1000) > 0) {
    words += convertNumberToMarathiWords(Math.floor(number / 1000)) + " हजार ";
    number %= 1000;
  }
  if (Math.floor(number / 100) > 0) {
    words += convertNumberToMarathiWords(Math.floor(number / 100)) + " शे ";
    number %= 100;
  }
  if (number > 0 && number < 100) {
    words += units[number];
  }
  return words.trim();
}

const generateDeptSalBillJCMCPDF = async ({
  reportData,
  reportType = "ALL",
  salaryDate: rawSalaryDate,
  corporationName = "",
  logo,
  month = "",
  year = "",
  department = "",
  zone = "",
  departmentName = "",
  billNo = "",
  summaryHead = "ADM",
  subDepartmentName = "",
  payCommissionName = "7 वा वेतन आयोग",
}) => {
  let browser;

  try {
    const templatePath = path.resolve(__dirname, "../../templates/FrmDepSalBillJCMC.html");
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const templateHtml = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(templateHtml);

    const monthYear = `${month}, ${year}`.replace(/^,\s*|,\s*$/g, "");
    const billDate = rawSalaryDate || new Date().toLocaleDateString("en-GB");
    const employees = reportData.employees || [];

    const parsedDate = rawSalaryDate ? new Date(rawSalaryDate) : new Date();
    const totalDaysInMonth = !isNaN(parsedDate.getTime())
      ? new Date(parsedDate.getFullYear(), parsedDate.getMonth() + 1, 0).getDate()
      : 31;

    const val = (emp, id) => Number(emp[`col${id}`] || 0);

    // 5 Addition Columns x 4 stacked slots
    const additionColumnSlots = [
      (emp) => [val(emp, 1), val(emp, 3), null, null],                     // Basic Pay, HRA
      (emp) => [val(emp, 2), val(emp, 5), val(emp, 6), null],            // DA, DA_Diff, 7th_Pay_Diff
      (emp) => [val(emp, 113), val(emp, 7), val(emp, 8), null],          // Wash_Allow, Sweeper_Allow, Tpt_Allow
      (emp) => [val(emp, 9), val(emp, 10), val(emp, 11), null],          // Petrol_Allow, DCPS 10 %, Cash_Allow
      (emp) => [val(emp, 12), val(emp, 13), val(emp, 14) || Number(emp.Total || 0), null], // Other, NPA, Gross
    ];

    // 10 Deduction Columns x 4 stacked slots
    const deductionColumnSlots = [
      (emp) => [val(emp, 15), val(emp, 124), val(emp, 17), null],        // PF_Subs, PF_Ref, PF_Subs_7th
      (emp) => [val(emp, 18), val(emp, 19), val(emp, 118), null],        // Prf_Tax, I_Tax, G.I.S
      (emp) => [val(emp, 21), val(emp, 22), val(emp, 23), null],         // Coop_Soc, Cons_Soc, CL_4_Soc
      (emp) => [val(emp, 24), val(emp, 25), val(emp, 26), null],         // DCPS 10 %, LIC, Mrutyu_Nidhi
      (emp) => [val(emp, 27), val(emp, 28), val(emp, 29), null],         // Pani / Ghar, Court_Rec, Audit_Rec
      (emp) => [val(emp, 30), val(emp, 31), val(emp, 101), null],        // Hsg_Rent, Bank_Rec, Granth_Rec
      (emp) => [val(emp, 102), val(emp, 103), val(emp, 104), null],      // Cash_Adv, Fest_Adv, Other_Pay
      (emp) => [val(emp, 105), val(emp, 106), val(emp, 107), null],      // Flag_Nidhi, Mudrank_Kapat, AccidentPolicy
      (emp) => [null, val(emp, 108), null, null],                        // DCPS 10%
      (emp) => [
        val(emp, 109) || Number(emp.DTotal || 0),
        val(emp, 110) || Number(emp.TotalPayamount || 0),
        null,
        null,
      ],                                                                 // Total_Deduc, Net_Pay
    ];

    const processedEmployees = employees.map((emp, index) => {
      const presentDays = Number(emp.presentdays || 0);
      const absentDays = Math.max(totalDaysInMonth - presentDays, 0);
      const leaveDays = "";

      return {
        srNo: index + 1,
        employeeName: emp.VAR_EMPLOYEE_ENGNAME || emp.VAR_EMPLOYEE_MARNAME || "",
        empCode: emp.EMPsequence || String(emp.num_employee_empid || "").padStart(5, "0"),
        designation: emp.Designation || "",
        pranNo: emp.GPFNOPRANNO || emp.pranno || emp.PfNo || "",
        absentDays,
        leaveDays,
        presentDays,
        payMatrix: emp.payscalename || "",
        payMatrixShort: (emp.payscalename || "").split(" ").slice(0, 2).join(" "),
        additionCells: additionColumnSlots.map((fn) => fn(emp)),
        deductionCells: deductionColumnSlots.map((fn) => fn(emp)),
      };
    });

    // Group by Designation + PayMatrix for post banner:
    // "1 Post Of आयुक्त in the Pay Matrix S-23 of 67700-208700 in Class- 1"
    const groupMap = new Map();
    processedEmployees.forEach((emp) => {
      const key = `${emp.designation}||${emp.payMatrix}`;
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          designation: emp.designation,
          payMatrix: emp.payMatrix,
          employees: [],
        });
      }
      groupMap.get(key).employees.push(emp);
    });

    const postGroups = Array.from(groupMap.values()).map((grp) => ({
      postBannerText: `${grp.employees.length} Post Of ${grp.designation} in the Pay Matrix ${grp.payMatrix}`,
      employees: grp.employees,
    }));

    const computeTotals = (slotsKey, colCount) =>
      Array.from({ length: colCount }, (_, colIdx) =>
        [0, 1, 2, 3].map((slotIdx) => {
          const hasAny = processedEmployees.some((e) => e[slotsKey][colIdx][slotIdx] !== null);
          if (!hasAny) return null;
          return processedEmployees.reduce((sum, e) => sum + Number(e[slotsKey][colIdx][slotIdx] || 0), 0);
        })
      );

    const additionTotals = computeTotals("additionCells", 5);
    const deductionTotals = computeTotals("deductionCells", 10);

    const grossTotalAmount = Number(reportData.aggregates?.earn || 0);
    const grossWords =
      grossTotalAmount === 0
        ? "शून्य"
        : `${convertNumberToMarathiWords(grossTotalAmount)} फक्त`;

    const postStrengthList =
      Array.isArray(reportData.postStrength) && reportData.postStrength.length > 0
        ? reportData.postStrength
        : [
            { designation: "आयुक्त", totalPost: 1, working: 1, vacant: 0 },
            { designation: "विशेष सहाय्यक", totalPost: 1, working: 0, vacant: 1 },
            { designation: "लिपीक", totalPost: 2, working: 1, vacant: 1 },
            { designation: "वाहन चालक", totalPost: 2, working: 1, vacant: 1 },
            { designation: "शिपाई", totalPost: 2, working: 2, vacant: 0 },
            { designation: "लेखाधिकारी", totalPost: 1, working: 1, vacant: 0 },
          ];

    const postSummaryRows = postStrengthList.map((item) => ({
      typeName: item.designation || "",
      postCount: Number(item.totalPost || 0),
      workingCount: Number(item.working || 0),
      riktCount: Number(item.vacant || 0),
    }));

    const totalPost = postSummaryRows.reduce((s, r) => s + r.postCount, 0);
    const totalWorking = postSummaryRows.reduce((s, r) => s + r.workingCount, 0);
    const totalRikt = postSummaryRows.reduce((s, r) => s + r.riktCount, 0);

    const templateData = {
      corporationName: corporationName || "",
      generatedTimestamp: new Date().toLocaleString("en-IN"),
      paysheetTitle: `PAY SHEET FOR THE MONTH OF ${monthYear || billDate}`,
      reportDate: billDate,
      summaryHead,
      departmentName: departmentName || department,
      subDepartmentName,
      billNo,
      payCommissionText: payCommissionName,
      postGroups,
      additionTotals,
      deductionTotals,
      grossTotalInWords: grossWords,
      postSummaryRows,
      totalPost,
      totalWorking,
      totalRikt,
      certificateText:
        "प्रमाणित करण्यात येते की, सदर वेतन देयकातील माहिती तपासण्यात आलेली आहे.",
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
    if (fs.existsSync(chromePath)) launchOptions.executablePath = chromePath;

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: { top: "5mm", bottom: "5mm", left: "5mm", right: "5mm" },
    });

    await browser.close();

    const outputDir = path.resolve(__dirname, "../../../public/pdf");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const fileName = `SalBill_930_${billNo}_${Date.now()}.pdf`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    return { fileName, filePath, pdfBuffer };
  } catch (error) {
    if (browser) await browser.close();
    console.error("ULB 930 PDF Generation Error:", error);
    throw error;
  }
};

module.exports = { generateDeptSalBillJCMCPDF };