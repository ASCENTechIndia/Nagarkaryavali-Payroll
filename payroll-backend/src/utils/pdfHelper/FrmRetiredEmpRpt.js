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

const RetiredEmployeePDFHelper = async ({
  rows,
  ulbInfo,
  filters,
}) => {
  console.log("PDF Helper - rows received:", rows ? rows.length : 0);

  if (!rows || rows.length === 0) {
    throw new Error("No data to generate PDF");
  }

  const templatePath = path.resolve(
    __dirname,
    "../../templates/FrmRetiredEmpRpt.html"
  );

  console.log("Template path:", templatePath);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found at: ${templatePath}`);
  }

  const htmlFile = fs.readFileSync(templatePath, "utf8");
  const template = Handlebars.compile(htmlFile);

  const lastDate = new Date(parseInt(filters.year), parseInt(filters.month), 0);
  const retireDate = `${String(lastDate.getDate()).padStart(2, "0")}/${String(lastDate.getMonth() + 1).padStart(2, "0")}/${lastDate.getFullYear()}`;

  const isSpecialUlb = ["930", "1750"].includes(filters.ulbid?.toString());
  const isUlb770 = filters.ulbid?.toString() === "770";

  const employees = rows.map((row, index) => ({
    SRNO: index + 1,
    oldslipno: row.oldslipno || "",
    oldempno: row.oldempno || "",
    name: row.name || "",
    retiredate: row.retiredate || "",
    department: row.department || "",
    type: row.type || "",
  }));

  let billNoDisplay = "";
  if (filters.billNo && filters.billNo !== "0" && filters.billNo !== "-1") {
    billNoDisplay = filters.billNo;
  }

  let departmentName = "-- ALL --";
  if (filters.deptId && filters.deptId !== "-1") {
    if (rows.length > 0 && rows[0].department) {
      departmentName = rows[0].department;
    }
    if (departmentName === "-- ALL --") {
      departmentName = rows.length > 0 ? rows[0].department || "-- ALL --" : "-- ALL --";
    }
  } else {
    departmentName = "-- ALL --";
  }

  if (filters.departmentName) {
    departmentName = filters.departmentName;
  }

  let corpName = ulbInfo.ABC_MUNICIPAL_TEXT || "Municipal Corporation";
  corpName = corpName.trim();

  let logoUrl = ulbInfo.ULBLOGO || "";

  if (!logoUrl) {
    try {
      const possibleLogoPaths = [
        //path.resolve(__dirname, "../../../public/images/logo.png"),
        //path.resolve(__dirname, "../../../public/images/logo.jpg"),
       // path.resolve(__dirname, "../../../public/logo.png"),
        //path.resolve(__dirname, "../../../public/logo.jpg"),
        path.resolve(__dirname, "../../../assets/NMC_Logo.jpeg"),
       // path.resolve(__dirname, "../../../assets/logo.png"),
       // path.resolve(__dirname, "../../../assets/logo.jpg"),
      ];

      for (const logoPath of possibleLogoPaths) {
        if (fs.existsSync(logoPath)) {
          logoUrl = imageToBase64(logoPath);
          console.log("Logo loaded from:", logoPath);
          break;
        }
      }

      if (!logoUrl) {
        console.log("No logo file found in any location");
      }
    } catch (err) {
      console.log("Error loading logo:", err.message);
    }
  }

  console.log("Department Name being passed to template:", departmentName);

  // Prepare data for template
  const data = {
    logo: logoUrl,
    corporationName: corpName,
    employees: employees,
    retireDate: retireDate,
    departmentName: departmentName,
    billNo: billNoDisplay,
    isSpecialUlb: isSpecialUlb,
    isUlb770: isUlb770,
  };

  console.log("Data being passed to template:", {
    hasLogo: !!data.logo,
    corporationName: data.corporationName,
    departmentName: data.departmentName,
    employeeCount: data.employees.length,
  });
 // Compile template
  const html = template(data);

  
  const debugHtmlPath = path.resolve(__dirname, "../../../public/debug.html");
  fs.writeFileSync(debugHtmlPath, html);
  console.log("Debug HTML saved to:", debugHtmlPath);

  
  const browserOptions = {
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-accelerated-2d-canvas",
      "--disable-accelerated-video-decode",
    ],
  };

  const possiblePaths = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ];

  for (const chromePath of possiblePaths) {
    if (fs.existsSync(chromePath)) {
      browserOptions.executablePath = chromePath;
      break;
    }
  }

  const browser = await puppeteer.launch(browserOptions);
  const page = await browser.newPage();

  await page.setViewport({
    width: 1200,
    height: 800,
  });

  await page.setContent(html, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    portrait: true,
    printBackground: true,
    margin: {
      top: "8mm",
      bottom: "8mm",
      left: "8mm",
      right: "8mm",
    },
  });

  await browser.close();

  const outputDir = path.resolve(__dirname, "../../../public/pdf");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `RetiredEmployee_${Date.now()}.pdf`;
  const filePath = path.join(outputDir, fileName);

  fs.writeFileSync(filePath, pdfBuffer);

  return {
    fileName,
    filePath,
  };
};

module.exports = {
  RetiredEmployeePDFHelper,
};