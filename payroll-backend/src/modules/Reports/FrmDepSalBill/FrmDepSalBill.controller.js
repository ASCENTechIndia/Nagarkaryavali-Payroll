const path = require("path");
const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");

const service = require("./FrmDepSalBill.service");
const { generateDeptSalBillPDF } = require("../../../utils/pdfHelper/generateDeptSalBillPDF");
const { getCorporationService } = require("../../MenuAccess/MenuAccess.service");

const getDeptSalBillPDF = asyncHandler(async (req, res) => {
  const filters = req.body;

  const reportType = filters.reportType || "EARN"; 

  const serviceResult = await service.getEarningDeductionTotalDataService(filters);

  console.log("serviceResult", serviceResult);

  if (serviceResult.status !== "SUCCESS" || !serviceResult.data || !serviceResult.data.employees || serviceResult.data.employees.length === 0) {
    return res.status(404).json({
      success: false,
      message: serviceResult.message || "No records found for the selected criteria",
    });
  }

  const reportData = serviceResult.data;

  const corpInfo = await getCorporationService({
    ulbId: filters.ulbId,
  });

  const pdf = await generateDeptSalBillPDF({
    reportData,
    reportType: reportType,
    salaryDate: filters.salaryDate,
    corporationName: corpInfo?.ABC_MUNICIPAL_TEXT || "सांगली, मिरज आणि कुपवाड शहर महानगरपालिका",
    logo: corpInfo?.ULBLOGO,
    month: filters.monthName || "",
    year: filters.year || "",
    department: filters.departmentName || "",
    departmentName: filters.departmentName || "महानगरपालिका अग्निशमन विभाग",
    category: filters.categoryName || "",
    zone: filters.zoneName || "",
  });

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const pdfUrl = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

  return res.json({
    success: true,
    message: "PDF Generated Successfully",
    fileName: pdf.fileName,
    pdfUrl,
  });
});

const getEarningDeductionTotalDataController = asyncHandler(async (req, res) => {
  const result = await service.getEarningDeductionTotalDataService(req.body);
  return ok(res, result, "Earning Deduction Total Data fetched successfully");
});

const getDeptSalBillExcel = asyncHandler(async (req, res) => {
  const filters = req.body;

  const reportType = filters.reportType || "EARN";

  const serviceResult = await service.getEarningDeductionTotalDataService(filters);

  if (serviceResult.status !== "SUCCESS" || !serviceResult.data || !serviceResult.data.employees || serviceResult.data.employees.length === 0) {
    return res.status(404).json({
      success: false,
      message: serviceResult.message || "No records found for the selected criteria",
    });
  }

  const reportData = serviceResult.data;
  const excelData = [];

  if (reportType === "EARN" || reportType === "ALL") {
    reportData.employees.forEach((emp) => {
      const row = {
        "Employee Code": emp.num_employee_empid,
        "Employee Name": emp.VAR_EMPLOYEE_MARNAME || emp.VAR_EMPLOYEE_ENGNAME || "",
        "Designation": emp.Designation || "",
        "Present Days": emp.presentdays || 0,
        "Basic Pay": emp.EarnBasic || 0,
        "Grade Pay": emp.GradePay || 0,
        "Total": (emp.EarnBasic || 0) + (emp.GradePay || 0),
        "Dearness Allowance": emp.col2 || 0,
        "House Rent": emp.col3 || 0,
        "Vehicle Allowance": emp.col109 || 0,
        "NMC D.C.P.S.": emp.col5 || 0,
        "Washing Allowance": emp.col12 || 0,
        "Typing Allowance": emp.col7 || 0,
        "Cleaning Allowance": emp.col8 || 0,
        "Other Allowances": emp.col9 || 0,
        "Total Salary": emp.Total || 0,
      };
      excelData.push(row);
    });
  } else if (reportType === "DEDUCT") {
    reportData.employees.forEach((emp) => {
      const row = {
        "Employee Code": emp.num_employee_empid,
        "Employee Name": emp.VAR_EMPLOYEE_MARNAME || emp.VAR_EMPLOYEE_ENGNAME || "",
        "PF": emp.col126 || 0,
        "PF Return": emp.col127 || 0,
        "Profession Tax": emp.col131 || 0,
        "Income Tax": emp.col132 || 0,
        "TDS": emp.col10 || 0,
        "Society 1": emp.col20 || 0,
        "Society 2": emp.col17 || 0,
        "Society 3": emp.col18 || 0,
        "Society 4": emp.col19 || 0,
        "Bank": emp.col21 || 0,
        "Financial Institution": emp.col128 || 0,
        "Refund": emp.col106 || 0,
        "Tasalmat": emp.col22 || 0,
        "Group Insurance": emp.col25 || 0,
        "DCPS 10%": emp.col28 || 0,
        "NMC DCPS": emp.col27 || 0,
        "Misc Fee": emp.col14 || 0,
        "JMFC": emp.col30 || 0,
        "House Rent Recovery": emp.col32 || 0,
        "HR Ancillary": emp.col108 || 0,
        "Water Tax": emp.col29 || 0,
        "House Tax": emp.col107 || 0,
        "Festival Advance": emp.col105 || 0,
        "Other Deduction": emp.col11 || 0,
        "Special Fund": emp.col24 || 0,
        "Total Deduction": emp.DTotal || 0,
        "Net Pay": emp.TotalPayamount || 0,
      };
      excelData.push(row);
    });
  }

  return res.json({
    success: true,
    message: "Excel data prepared successfully",
    data: excelData,
    fileName: `Salary_Sheet_${filters.monthName || ""}_${filters.year || ""}`,
  });
});

module.exports = {
  getDeptSalBillPDF,
  getEarningDeductionTotalDataController,
  getDeptSalBillExcel
};