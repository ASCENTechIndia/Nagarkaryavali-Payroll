const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

const formatTime = (date) =>
    date
        .toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        })
        .replace(/\s+([AP]M)/i, (_, m) => m.toUpperCase());

const formatAmountDecimals = (val) =>
    Number(val || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const formatPlainAmount = (val) => {
    const num = Number(val || 0);
    return Number.isInteger(num) ? String(num) : num.toFixed(2);
};

async function renderHtmlToPdf({ html, prefix, landscape = false }) {
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
        console.log("Using Chrome:", chromePath);
    } else {
        console.log("Chrome path not found, using Puppeteer's default executable.");
    }

    let browser;
    try {
        browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const images = Array.from(document.images);
            await Promise.all(
                images.map((img) => {
                    if (img.complete) return Promise.resolve();
                    return new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                })
            );
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            landscape,
            printBackground: true,
            preferCSSPageSize: true,
            margin: { top: "8mm", right: "8mm", bottom: "8mm", left: "8mm" },
        });

        const outputDir = path.resolve(__dirname, "../../../public/pdf");
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const fileName = `${prefix}_${Date.now()}.pdf`;
        const filePath = path.join(outputDir, fileName);
        fs.writeFileSync(filePath, pdfBuffer);

        return { fileName, filePath };
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (err) {
                console.error("Failed to close Puppeteer browser:", err);
            }
        }
    }
}

const cleanAccountNo = (val) => {
    if (val == null) return "";
    const trimmed = String(val).trim();
    return trimmed === "-" ? "" : trimmed;
};

const CashReportPDFHelper = async ({
    rows,
    salaryMonth,
    department,
    paymode,
    corporationName,
    userId,
}) => {
    const templatePath = path.resolve(__dirname, "../../templates/FrmCashNCheckCash.html");
    const template = Handlebars.compile(fs.readFileSync(templatePath, "utf8"));

    let totalPayable = 0;
    let cashChequeTotal = 0;
    let indianBankTotal = 0;
    let axisBankTotal = 0;

    const reportRows = rows.map((row, index) => {
        const payable = Number(row.PAYABLEAMT || 0);
        const axisAcc = cleanAccountNo(row.AXISACCNO);
        const indAcc = cleanAccountNo(row.INDACCNO);

        totalPayable += payable;
        if (axisAcc) {
            axisBankTotal += payable;
        } else if (indAcc) {
            indianBankTotal += payable;
        } else {
            cashChequeTotal += payable;
        }

        return {
            SRNO: index + 1,
            BILLNO: row.BILLNO || "",
            SLIPNO: row.SLIPNO || "",
            EMPNAME: row.EMPNAME || "",
            AXISACCNO: axisAcc,
            INDACCNO: indAcc,
            PAYABLEAMT: formatPlainAmount(payable),
        };
    });

    const now = new Date();
    const html = template({
        corporationName: corporationName || "",
        salaryMonth,
        department: department || "All",
        paymode: paymode || "All",
        printDate: now.toLocaleDateString("en-GB"),
        printTime: formatTime(now),
        userId: userId || "",
        rows: reportRows,
        totalPayable: formatPlainAmount(totalPayable),
        cashChequeTotal: cashChequeTotal > 0 ? formatPlainAmount(cashChequeTotal) : "",
        indianBankTotal: indianBankTotal > 0 ? formatPlainAmount(indianBankTotal) : "",
        axisBankTotal: axisBankTotal > 0 ? formatPlainAmount(axisBankTotal) : "",
    });

    return renderHtmlToPdf({ html, prefix: "Cash_and_Check", landscape: false });
};

const DcpsReportPDFHelper = async ({
    rows,
    salaryMonth,
    corporationName,
    userId,
}) => {
    const templatePath = path.resolve(__dirname, "../../templates/FrmCashNCheckDcps.html");
    const template = Handlebars.compile(fs.readFileSync(templatePath, "utf8"));

    const rawTotals = {
        basic: 0,
        gp: 0,
        da: 0,
        eDcps14: 0,
        dDcps10: 0,
        dDcps14: 0,
        total: 0,
    };

    const reportRows = rows.map((row, index) => {
        const basic = Number(row.E_BASIC || 0);
        const gp = Number(row.E_GP || 0);
        const da = Number(row.E_DA || 0);
        const eDcps14 = Number(row.E_DCPS14 || 0);
        const dDcps10 = Number(row.D_DCPS10 || 0);
        const dDcps14 = Number(row.D_DCPS14 || 0);
        // एकूण रक्कम = Employee 10% + Employer 14% DCPS deduction contribution
        const rowTotal = dDcps10 + dDcps14;

        rawTotals.basic += basic;
        rawTotals.gp += gp;
        rawTotals.da += da;
        rawTotals.eDcps14 += eDcps14;
        rawTotals.dDcps10 += dDcps10;
        rawTotals.dDcps14 += dDcps14;
        rawTotals.total += rowTotal;

        return {
            SRNO: index + 1,
            BILLNO: row.BILLNO || "",
            SLIPNO: row.SLIPNO || "",
            EMPNAME: row.EMPNAME || "",
            E_BASIC: formatAmountDecimals(basic),
            E_GP: formatAmountDecimals(gp),
            E_DA: formatAmountDecimals(da),
            E_DCPS14: formatAmountDecimals(eDcps14),
            D_DCPS10: formatAmountDecimals(dDcps10),
            D_DCPS14: formatAmountDecimals(dDcps14),
            TOTAL: formatAmountDecimals(rowTotal),
        };
    });

    const now = new Date();
    const html = template({
        corporationName: corporationName || "",
        salaryMonth,
        printDate: now.toLocaleDateString("en-GB"),
        printTime: formatTime(now),
        userId: userId || "",
        rows: reportRows,
        totals: {
            basic: formatAmountDecimals(rawTotals.basic),
            gp: formatAmountDecimals(rawTotals.gp),
            da: formatAmountDecimals(rawTotals.da),
            eDcps14: formatAmountDecimals(rawTotals.eDcps14),
            dDcps10: formatAmountDecimals(rawTotals.dDcps10),
            dDcps14: formatAmountDecimals(rawTotals.dDcps14),
            total: formatAmountDecimals(rawTotals.total),
        },
    });

    return renderHtmlToPdf({ html, prefix: "DCPS_Addition_Deduction", landscape: false });
};

const ManualPayslipPDFHelper = async ({
    employees,
    salaryMonthDash,
    paidDate,
    corporationName,
    corporationAddress,
    corporationLogo,
}) => {
    const templatePath = path.resolve(__dirname, "../../templates/FrmCashNCheckPayslip.html");
    const template = Handlebars.compile(fs.readFileSync(templatePath, "utf8"));

    const slips = employees.map((emp) => {
        const earnings = Array.isArray(emp.earnings) ? emp.earnings : [];
        const deductions = Array.isArray(emp.deductions) ? emp.deductions : [];
        const maxLen = Math.max(earnings.length, deductions.length);

        const pairedRows = [];
        for (let i = 0; i < maxLen; i++) {
            const e = earnings[i];
            const d = deductions[i];
            pairedRows.push({
                eHead: e ? e.head : "",
                eAmt: e ? formatAmountDecimals(e.amount) : "",
                dHead: d ? d.head : "",
                dAmt: d ? formatAmountDecimals(d.amount) : "",
            });
        }

        const gross = Number(emp.grossSalary || 0);
        const totalDed = Number(emp.totalDeduction || 0);
        const net = Number(emp.netSalary ?? gross - totalDed);

        return {
            empName: emp.EmpMName || emp.EmpEName || "",
            designation: emp.Designation || "",
            deptName: emp.Dept || "",
            rows: pairedRows,
            grossSalary: gross.toFixed(2),
            totalDeduction: totalDed.toFixed(2),
            netSalary: formatAmountDecimals(net),
        };
    });

    const html = template({
        slips,
        salaryMonthDash,
        paidDate,
        corporationName: corporationName || "",
        corporationAddress: corporationAddress || "",
        corporationLogo: corporationLogo || "",
    });

    return renderHtmlToPdf({ html, prefix: "Manual_Payslip", landscape: false });
};

module.exports = {
    CashReportPDFHelper,
    DcpsReportPDFHelper,
    ManualPayslipPDFHelper,
};
