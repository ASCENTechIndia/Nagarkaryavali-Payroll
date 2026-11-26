
const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const path = require("path");
const service = require("./FrmDeptBillSummary.service");
const {
  DeptBillSummaryPDFHelper
} = require("../../../utils/pdfHelper/FrmDeptBillSummary");





// 1. Summary Head Wise Salary
exports.getSummaryHeadWiseSalary = asyncHandler(async (req, res) => {
  const {
    fromDate,
    toDate,
    ulbId,
    employeeStatus
  } = req.body;

  if (!ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  if (!fromDate || !toDate) {
    throw new AppError("fromDate and toDate are required", 400);
  }

  const data = await service.getSummaryHeadWiseSalaryService({
    fromDate,
    toDate,
    ulbId,
    employeeStatus
  });

  return ok(res, data, "Summary head wise salary fetched successfully");
});


// 2. Department Payhead Summary
exports.getDepartmentPayheadSummary = asyncHandler(async (req, res) => {
  const {
    fromDate,
    toDate,
    ulbId,
    deptId
  } = req.body;

  if (!ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  if (!deptId || deptId === "0" || deptId === "-1") {
    throw new AppError("Valid Department is required", 400);
  }

  if (!fromDate || !toDate) {
    throw new AppError("fromDate and toDate are required", 400);
  }

  const data = await service.getDepartmentPayheadSummaryService({
    fromDate,
    toDate,
    ulbId,
    deptId
  });

  return ok(res, data, "Department payhead summary fetched successfully");
});


// 3. Payhead Master
exports.getPayheadMaster = asyncHandler(async (req, res) => {
  const { ulbId } = req.body;

  if (!ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  const data = await service.getPayheadMasterService(ulbId);

  return ok(res, data, "Payhead master fetched successfully");
});




exports.generateDeptBillSummaryPDF = asyncHandler(async (req, res) => {
  const {
    fromDate,
    toDate,
    ulbId,
    employeeStatus = "NEW",
    month,
    year
  } = req.body;

  if (!ulbId || !fromDate || !toDate) {
    throw new AppError("Required parameters are missing", 400);
  }

  const result = await service.getSummaryHeadWiseSalaryService({
    fromDate,
    toDate,
    ulbId,
    employeeStatus
  });

  const pdf = await DeptBillSummaryPDFHelper({
    rows: result.data,
    month,
    year,
    ulbId
  });

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const pdfUrl = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

  return res.json({
    success: true,
    message: "Department Bill Summary PDF generated successfully",
    fileName: pdf.fileName,
    pdfUrl
  });
});
