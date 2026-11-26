
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

Handlebars.registerHelper("formatNumber", function (value) {
  if (value === undefined || value === null || value === "") return "";
  Handlebars.registerHelper("multiply", function (a, b) {
  return Number(a || 0) * Number(b || 0);
});

  const num = Number(value);

  if (isNaN(num)) return "";

  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
});

Handlebars.registerHelper("sum", function (a, b) {
  return Number(a || 0) + Number(b || 0);
});

// Three rows, each containing 5 Addition + 8 Deduction columns.
// All dbField values below use the actual view column names.

const PAYHEAD_ROWS = [
  [
    { label: "Basic Pay", field: "BASICPAY" },
    { label: "DA", field: "DEARNESSALLOWANCE" },
    { label: "Wash_Allow", field: "WASHINGALLOWANCE" },
    { label: "Petrol_Allow", field: "PETROLALLOWANCE" },
    { label: "Other", field: "OTHERALLOWANCE" },

    { label: "PF_Subs", field: "FUNDWARGANI" },
    { label: "I_Tax", field: "INCOMETAX" },
    { label: "Cons_Soc", field: "CONSUMERSOCIETY" },
    { label: "LIC", field: "LIC" },
    { label: "Court_Rec", field: "COURT" },
    { label: "DCPS 10%", field: "DCPSD" },
    { label: "Other_Pay", field: "OTHER" },
    { label: "Fest_Adv", field: null }
  ],

  [
    { label: "Grade_Pay", field: "GRADEPAY" },
    { label: "DA_Diff", field: "DADIFF" },
    { label: "Sweeper_Allo", field: "SWEEPERALLOWANCE" },
    { label: "DCPS 14%", field: "DCPSE" },
    { label: "NPA", field: "NPA" },

    { label: "PF_Ref", field: "FUNDKARJ" },
    { label: "G.I.S", field: "GIS" },
    { label: "CL_4_Soc", field: "FOURSOCIETY" },
    { label: "Mrutyu_Nidhi", field: "MRUTYUNIDHI" },
    { label: "Hsg_Rent", field: "BANGLABHADE" },
    { label: "Flag_Nidhi", field: "DHWAJNIDHI" },
    { label: "Grant_Rec", field: "GRANTHALAY" },
    { label: "Mudrank_Kapat", field: "MUDRANK" }
  ],

  [
    { label: "HRA", field: "GHARBHADE" },
    { label: "7 वा वेतन फरक 4/48 Inst", field: "SIXPAYDIFF" },
    { label: "Tpt_Allow", field: "TPTAALOWANCE" },
    { label: "Cash_Allow", field: "CASHALLOWANCE" },
    { label: "Gross", field: "EARNING" },

    { label: "Prf_Tax", field: "VYAVSAYKAR" },
    { label: "Coop_Soc", field: "GASASOSA" },
   { label: "DCPS 14%", field: "DCPSE" },
    { label: "Pani / Ghar", field: "PANIGHARPATTI" },
    { label: "Bank_Rec", field: "BANKHAFTA" },
    { label: "PF_Subs_7th_Pay_Diff_4/48_Inst", field: "PENSIONANSHDAN" },
    { label: "AccidentPolicy", field: "APAGHATVIMA" },
    { label: "Audit_Rec", field: "AUDIT_REC" }
  ]
];

function getAmount(row, field) {
  if (!field) return 0;

  const value = row[field];

  return value === undefined || value === null || value === ""
    ? 0
    : Number(value) || 0;
}

// Build the three display rows from one database record
function buildSalaryRows(record) {
  return PAYHEAD_ROWS.map((columns) => ({
    columns: columns.map((column) => ({
      label: column.label,
      amount: getAmount(record, column.field)
    }))
  }));
}

// Group by department (SUMHEAD)
function buildDepartmentGroups(rows) {
  const groups = {};

  (rows || []).forEach((record) => {
    const departmentName = record.SUMHEAD || "Department";

    if (!groups[departmentName]) {
      groups[departmentName] = {
        departmentName,
        records: []
      };
    }

    groups[departmentName].records.push({
      salaryRows: buildSalaryRows(record),
      totalDeduction: getAmount(record, "DEDUCTION"),
      netPay: getAmount(record, "NETPAY")
    });
  });

  return Object.values(groups);
}

const DeptBillSummaryPDFHelper = async ({
  rows = [],
  month = "",
  year = "",
  corporationName = "जळगाव शहर महानगरपालिका",
  ulbId = "",
  userId = ""
}) => {
  let browser;

  try {
    if (!rows || rows.length === 0) {
      throw new Error("No salary summary records available");
    }

    const templatePath = path.resolve(
      __dirname,
      "../../templates/FrmDeptBillSummary.html"
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const templateHtml = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(templateHtml);

    const departmentGroups = buildDepartmentGroups(rows);

    const templateData = {
      corporationName,
      month,
      year,
      ulbId,
      userId,
      departmentGroups
    };

    const html = template(templateData);

    const launchOptions = {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    };

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    await page.setViewport({
      width: 1600,
      height: 1100
    });

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    const pdfBuffer = await page.pdf({
      format: "A3",
      landscape: true,
      printBackground: true,
      margin: {
        top: "8mm",
        bottom: "8mm",
        left: "8mm",
        right: "8mm"
      },
      preferCSSPageSize: true
    });

    await browser.close();
    browser = null;

    const outputDir = path.resolve(
      __dirname,
      "../../../public/pdf"
    );

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `Department_Bill_Summary_${Date.now()}.pdf`;
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, pdfBuffer);

    return {
      fileName,
      filePath
    };

  } catch (error) {
    if (browser) {
      await browser.close();
    }

    console.error("Department Bill Summary PDF Error:", error);
    throw error;
  }
};

module.exports = {
  DeptBillSummaryPDFHelper
};
