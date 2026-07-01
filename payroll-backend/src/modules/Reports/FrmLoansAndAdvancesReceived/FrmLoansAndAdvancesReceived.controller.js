const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const service = require("./FrmLoansAndAdvancesReceived.service");
const { LoansAdvancesPDFHelper } = require("../../../utils/pdfHelper/FrmLoansAndAdvancesReceived");
const path = require("path");

exports.getPayHeadsList = asyncHandler(async (req, res) => {
  const { ulbId } = req.body;
  
  if (!ulbId) {
    throw new AppError("ulbId is required", 400);
  }
  
  const data = await service.getPayHeadsListService(ulbId);
  return ok(res, data, "Payheads list fetched successfully");
});

exports.searchLoansAdvances = asyncHandler(async (req, res) => {
  const {
    ulbId,
    payHeadId,
    empStatus,
    fromDate
  } = req.body;

  if (!ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  const data = await service.searchLoansAdvancesService({
    ulbId,
    payHeadId,
    empStatus,
    fromDate
  });

  return ok(res, data, "Loans and advances data fetched successfully");
});

exports.generateLoansAdvancesPDF = asyncHandler(async (req, res) => {
  const {
    ulbId,
    payHeadId,
    empStatus,
    fromDate
  } = req.body;

  const reportResult = await service.searchLoansAdvancesService({
    ulbId,
    payHeadId,
    empStatus,
    fromDate
  });

  const payHeadsName = reportResult.payHeadsName;

  const pdf = await LoansAdvancesPDFHelper({
    rows: reportResult.data,
    payHeadsName: payHeadsName,
    fromDate: fromDate,
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