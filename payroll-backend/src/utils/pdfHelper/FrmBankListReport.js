const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

const BankListReportPDFHelper = async ({ rows, filters, salaryMonth, corporationName, corporationLogo, userId, ulbid }) => {
  const templatePath = path.resolve(__dirname, "../../templates/FrmBankListReportJCMC.html");

  const htmlFile = fs.readFileSync(templatePath, "utf8");
  const template = Handlebars.compile(htmlFile);

  const ulbID = Number(ulbid);

  let grandTotal = 0;
  let indianBankPayment = 0;
  let axisBankPayment = 0;
  let cashCheque = 0;

  const isValidAccount = (value) => {
    const account = String(value ?? "").trim();
    return account !== "" && account !== "-";
  };

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const reportRows = rows.map((row, index) => {
    const payable = Number(row.PAYABLEAMT || 0);
    const bankName = String(row.BANKNAME || "")
      .trim()
      .toUpperCase();

    // ULB 930: .NET returns the account number in ACCNO.
    // ULB 1750: .NET returns separate Axis and Indian account numbers.
    const accountNo = row.ACCNO || "";

    const axisAccount = row.AXISACCNO || "";
    const indianAccount = row.INDACCNO || "";

    if (ulbID === 930) {
      if (isValidAccount(accountNo)) {
        if (bankName.includes("INDIAN BANK")) {
          indianBankPayment += payable;
        } else if (bankName.includes("AXIS")) {
          axisBankPayment += payable;
        }
      } else {
        cashCheque += payable;
      }
    } else {
      if (isValidAccount(axisAccount)) {
        axisBankPayment += payable;
      } else if (isValidAccount(indianAccount)) {
        indianBankPayment += payable;
      } else {
        cashCheque += payable;
      }
    }

    grandTotal += payable;

    return {
      SRNO: index + 1,
      BILLNO: row.BILLNO || "",
      SLIPNO: row.SLIPNO || "",
      EMPNAME: row.EMPNAME || "",

      // Generic account number for ULB 930
      ACCNO: isValidAccount(accountNo) ? accountNo : "-",

      // Separate account numbers for ULB 1750
      AXISACCNO: isValidAccount(axisAccount) ? axisAccount : "-",
      INDACCNO: isValidAccount(indianAccount) ? indianAccount : "-",

      BANKNAME: row.BANKNAME || "",
      IFSC: row.IFSC || "",

      PAYABLEAMT: formatAmount(payable),
    };
  });

  const now = new Date();

  const printDate = now.toLocaleDateString("en-GB");

  const printTime = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const html = template({
    ulbid: Number(ulbid),

    corporationName: corporationName || "",
    corporationLogo: corporationLogo || "",
    salaryMonth,

    department: filters?.deptName || (Number(filters?.deptId) === -1 ? "All" : filters?.deptId),

    bank: filters?.bankName || (Number(filters?.bankId) === -1 ? "All" : filters?.bankId),

    subDept: filters?.subDeptName || "",

    printDate,
    printTime,
    userId: userId || "",

    rows: reportRows,

    grandTotal: formatAmount(grandTotal),
    cashCheque: formatAmount(cashCheque),
    indianBankPayment: formatAmount(indianBankPayment),
    axisBankPayment: formatAmount(axisBankPayment),
  });

  //--------------------------------------------------
  // Chrome Path
  //--------------------------------------------------

  const chromePath = path.resolve(__dirname, "../../../node_modules/puppeteer/.cache/puppeteer/chrome/win64-135.0.7049.84/chrome-win64/chrome.exe");

  //--------------------------------------------------
  // Puppeteer Launch Options
  //--------------------------------------------------

  const launchOptions = {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };

  if (fs.existsSync(chromePath)) {
    launchOptions.executablePath = chromePath;
    console.log("Using Chrome:", chromePath);
  } else {
    console.log("Chrome path not found, using Puppeteer's default executable.");
  }

  //--------------------------------------------------
  // Launch Browser
  //--------------------------------------------------

  let browser;

  try {
    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    //--------------------------------------------------
    // Set HTML
    //--------------------------------------------------

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 0,
    });

    //--------------------------------------------------
    // Wait For Images
    //--------------------------------------------------

    await page.evaluate(async () => {
      const images = Array.from(document.images);

      await Promise.all(
        images.map((img) => {
          if (img.complete) {
            return Promise.resolve();
          }

          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }),
      );
    });

    //--------------------------------------------------
    // Generate PDF
    //--------------------------------------------------

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: false,
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "8mm",
        right: "8mm",
        bottom: "8mm",
        left: "8mm",
      },
    });

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

    const fileName = `BankList_${Date.now()}.pdf`;

    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, pdfBuffer);

    //--------------------------------------------------
    // Return
    //--------------------------------------------------

    return {
      fileName,
      filePath,
    };
  } catch (error) {
    console.error("Bank List PDF generation failed:", error);

    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.error("Failed to close Puppeteer browser:", error);
      }
    }
  }
};

module.exports = {
  BankListReportPDFHelper,
};
