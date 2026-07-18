const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

const RetiredEmployeePDFHelper = async ({
  rows,
  ulbInfo,
  filters,
}) => {

  const templatePath = path.resolve(
    __dirname,
    "../../templates/FrmRetiredEmpRpt.html"
  );

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found at: ${templatePath}`);
  }

  const htmlFile = fs.readFileSync(templatePath, "utf8");
  
  // Get retire date
  const lastDate = new Date(parseInt(filters.year), parseInt(filters.month), 0);
  const retireDate = `${String(lastDate.getDate()).padStart(2, "0")}/${String(lastDate.getMonth() + 1).padStart(2, "0")}/${lastDate.getFullYear()}`;

  // Determine if special ULB
  const isSpecialUlb = ["930", "1750"].includes(filters.ulbid?.toString());
  const isUlb770 = filters.ulbid?.toString() === "770";

  console.log("isSpecialUlb:", isSpecialUlb, "isUlb770:", isUlb770);

  // Format data - ensure all fields exist
  const employees = rows.map((row, index) => {
    // Log each row to see what we're getting
    console.log(`Row ${index + 1} data:`, JSON.stringify(row, null, 2));
    
    return {
      SRNO: index + 1,
      billno: row.billno || "",
      oldslipno: row.oldslipno || "",
      oldempno: row.oldempno || "",
      name: row.name || "",
      retiredate: row.retiredate || "",
      department: row.department || "",
      type: row.type || "",
      grade: row.grade || "",
      dob: row.dob || "",
      designation: row.designation || "",
      subdept: row.subdept || "",
      newslipno: row.newslipno || "",
    };
  });

  console.log("First employee after mapping:", JSON.stringify(employees[0], null, 2));

  // Get bill no display
  let billNoDisplay = "";
  if (filters.billNo && filters.billNo !== "0" && filters.billNo !== "-1") {
    billNoDisplay = filters.billNo;
  }

  // Get department name
  let departmentName = "-- ALL --";
  if (rows.length > 0 && employees[0].department) {
    departmentName = employees[0].department;
  }

  // Corporation name
  let corpName = ulbInfo.ABC_MUNICIPAL_TEXT || "Municipal Corporation";
  corpName = corpName.trim();

  // Prepare data for template
  const data = {
    corporationName: corpName,
    employees: employees,
    retireDate: retireDate,
    departmentName: departmentName,
    billNo: billNoDisplay,
    isSpecialUlb: isSpecialUlb,
    isUlb770: isUlb770,
  };

  console.log("Data being passed to template:", {
    corporationName: data.corporationName,
    employeeCount: data.employees.length,
    firstEmployeeName: data.employees[0]?.name,
    firstEmployeeDept: data.employees[0]?.department,
    firstEmployeeRetireDate: data.employees[0]?.retiredate,
  });

  // Compile template
  const template = Handlebars.compile(htmlFile);
  const html = template(data);

  // Save debug HTML
  const debugHtmlPath = path.resolve(__dirname, "../../../public/debug.html");
  fs.writeFileSync(debugHtmlPath, html);
  console.log("Debug HTML saved to:", debugHtmlPath);

  // Puppeteer launch options
  const launchOptions = {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--font-render-hinting=none",
    ],
  };

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  await page.setViewport({
    width: 1200,
    height: 800,
  });

  await page.setContent(html, {
    waitUntil: "networkidle0",
    timeout: 30000,
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    landscape: true,
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
  console.log("PDF saved to:", filePath);

  return {
    fileName,
    filePath,
  };
};

module.exports = {
  RetiredEmployeePDFHelper,
};