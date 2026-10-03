const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmEmpLstRpt.service");
const path = require("path");
const {
  EmployeeListPDFHelper,
} = require("../../../utils/pdfHelper/FrmEmpLstRpt");
const {
  generateBillDmcPDF: generateBillDmcPDFHelper,
} = require("../../../utils/pdfHelper/FrmBillDmcTeriz.js");
const { generateBillDmcPDF2 } = require("../../../utils/pdfHelper/FrmBillDmcTeriz2.js");



const { getCorporationService } = require("../../MenuAccess/MenuAccess.service");


exports.getEmployeeList = asyncHandler(async (req, res) => {
    const {
        ulbid,
        empId,
        categoryId,
        deptId,
        desigId,
        gender,
        empStatus
    } = req.body;

    const result = await service.getEmployeeListService({
        ulbid,
        empId,
        categoryId,
        deptId,
        desigId,
        gender,
        empStatus
    });

    return ok(res, result, "Employee list fetched successfully");
});

exports.generateEmployeeListPDF = asyncHandler(async (req, res) => {

  const filters = req.body;

  const result = await service.getEmployeeListService(filters);

//   const ulbInfo = await getCorporationService({
//     ulbId: filters.ulbid,
//   });


  const ulbInfo = {
    ULBLOGO: "",
    ABC_MUNICIPAL_TEXT: "सांगली, मिरज आणि कुपवाड शहर महानगरपालिका",
  };

  const pdf = await EmployeeListPDFHelper({
    rows: result.data,
    ulbInfo,
  });

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const pdfUrl =
    `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

  return res.json({
    success: true,
    message: "Employee List PDF Generated Successfully",
    fileName: pdf.fileName,
    pdfUrl,
  });
});


exports.getSalaryDetail = asyncHandler(async (req, res) => {
    const { lstdate, ulbid, deptId, gender } = req.body;

    const result = await service.getSalaryDetailService({
        lstdate,
        ulbid,
        deptId,
        gender
    });

    return ok(res, result, "Salary detail fetched successfully");
});

exports.getEmployeeSubDetail = asyncHandler(async (req, res) => {
    const { lstdate, ulbid, deptId, gender } = req.body;

    const result = await service.getEmployeeSubDetailService({
        lstdate,
        ulbid,
        deptId,
        gender
    });

    return ok(res, result, "Employee sub detail fetched successfully");
});

exports.getPayheadSalaryDetail = asyncHandler(async (req, res) => {
    const { lstdate, ulbid, deptId, gender } = req.body;

    const result = await service.getPayheadSalaryDetailService({
        lstdate,
        ulbid,
        deptId,
        gender
    });

    return ok(res, result, "Payhead salary detail fetched successfully");
});

exports.generateBillDmcPDF = asyncHandler(async (req, res) => {
    const { ulbid, deptId, deptName, gender, lstdate, monthName, yearName } = req.body;

    if (!ulbid) return fail(res, "ULB ID is required", 400);
    if (!deptId || deptId === "-1") return fail(res, "Please Select Department Name", 400);

    const billDetail = await service.getSalaryDetailService({
        lstdate,
        ulbid,
        deptId,
        gender
    });

    const subDetail = await service.getEmployeeSubDetailService({
        lstdate,
        ulbid,
        deptId,
        gender
    });

    const payhead = await service.getPayheadSalaryDetailService({
        lstdate,
        ulbid,
        deptId,
        gender
    });

    console.log("billDetail: ", billDetail);
    console.log("subDetail: ", subDetail);
    console.log("payhead: ", payhead);

    let corpInfo = {};
    try {
        corpInfo = await getCorporationService({ ulbId: ulbid });
    } catch (e) {
        corpInfo = {};
    }

    const corporationName =
        corpInfo?.ABC_MUNICIPAL_TEXT || corpInfo?.ULBNAME || deptName || "";
    const logo = corpInfo?.ULBLOGO || "";

    const genderText =
        String(deptId) === "406"
            ? (gender === "Male" || gender === "M" ? "पुरुष" : "स्त्री")
            : "";

    const pdf = await generateBillDmcPDFHelper({
        billDetailRows: billDetail.data,
        netEarning: billDetail.netEarning,
        subDetailRows: subDetail.data,
        payheadRows: payhead.data,
        departmentName: deptName,
        genderText,
        monthName,
        yearName,
        lstdate,
        deptId,
        corporationName,
        logo,
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const pdfUrl = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

    return res.json({
        success: true,
        message: "Bill DMC PDF Generated Successfully",
        fileName: pdf.fileName,
        pdfUrl,
    });
});

exports.generateSummaryReportPDF = asyncHandler(async (req, res) => {
  const {
    ulbid,
    deptId,
    deptName,
    gender,
    lstdate,
    monthName,
    yearName,
  } = req.body;

  if (!ulbid) return fail(res, "ULB ID is required", 400);
  if (!deptId || deptId === "-1")
    return fail(res, "Please Select Department Name", 400);

  const billDetail = await service.getSalaryDetailService({
    lstdate,
    ulbid,
    deptId,
    gender,
  });

  const subDetail = await service.getEmployeeSubDetailService({
    lstdate,
    ulbid,
    deptId,
    gender,
  });

  const payhead = await service.getPayheadSalaryDetailService({
    lstdate,
    ulbid,
    deptId,
    gender,
  });

  let corpInfo = {};
  try {
    corpInfo = await getCorporationService({ ulbId: ulbid });
  } catch (e) {
    corpInfo = {};
  }

  const corporationName =
    corpInfo?.ABC_MUNICIPAL_TEXT || corpInfo?.ULBNAME || deptName || "";
  const logo = corpInfo?.ULBLOGO || "";

  const genderText =
    String(deptId) === "406"
      ? gender === "Male" || gender === "M"
        ? "पुरुष"
        : "स्त्री"
      : "";

  const pdf = await generateBillDmcPDF2({
    billDetailRows: billDetail.data,
    netEarning: billDetail.netEarning,
    subDetailRows: subDetail.data,
    payheadRows: payhead.data,
    departmentName: deptName,
    genderText,
    monthName,
    yearName,
    lstdate,
    deptId,
    corporationName,
    logo,
  });

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const pdfUrl = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

  return res.json({
    success: true,
    message: "Summary Report PDF Generated Successfully",
    fileName: pdf.fileName,
    pdfUrl,
  });
});
