const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const service = require("./FrmDeductionPayheadsDtls.service");
const { DeductionPayheadsPDFHelper } = require("../../../utils/pdfHelper/FrmDeductionPayheadsDtls");
const path = require("path");

exports.getDepartments = asyncHandler(async (req, res) => {
  const { ulbId } = req.body;
  
  if (!ulbId) {
    throw new AppError("ulbId is required", 400);
  }
  
  const data = await service.getDepartmentsService(ulbId);
  return ok(res, data, "Departments fetched successfully");
});

exports.getPayHeadsList = asyncHandler(async (req, res) => {
  const { ulbId } = req.body;
  
  if (!ulbId) {
    throw new AppError("ulbId is required", 400);
  }
  
  const data = await service.getPayHeadsListService(ulbId);
  return ok(res, data, "Payheads list fetched successfully");
});

exports.searchDeductions = asyncHandler(async (req, res) => {
  const {
    ulbId,
    deptId,
    payheadId,
    salDate
  } = req.body;

  if (!ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  const data = await service.searchDeductionsService({
    ulbId,
    deptId,
    payheadId,
    salDate
  });

  return ok(res, data, "Deduction data fetched successfully");
});

exports.generateDeductionsPDF = asyncHandler(async (req, res) => {
  const {
    ulbId,
    deptId,
    payheadId,
    month,
    year,
    reportData
  } = req.body;

  // If reportData not provided, fetch it
  let data = reportData;
  if (!data) {
    const lastDate = new Date(year, month, 0);
    const salDate = lastDate.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }).toUpperCase();
    
    const result = await service.searchDeductionsService({
      ulbId,
      deptId,
      payheadId,
      salDate
    });
    data = result.data;
  }

  const pdf = await DeductionPayheadsPDFHelper({
    rows: data,
    payheadId: payheadId,
    month: month,
    year: year,
    ulbId: ulbId,
    userId: req.user.userId
  });

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const pdfUrl = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

  return res.json({
    success: true,
    message: "PDF Generated Successfully",
    fileName: pdf.fileName,
    pdfUrl
  });
});