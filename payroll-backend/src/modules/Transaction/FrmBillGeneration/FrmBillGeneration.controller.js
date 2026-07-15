const asyncHandler = require("../../../libs/asyncHandler");
const { AppError } = require("../../../libs/errors");
const { ok } = require("../../../libs/response");

const path = require("path");

const service = require("./FrmBillGeneration.service");

const {
  BillGenerationPDFHelper,
} = require("../../../utils/pdfHelper/BillGenerationPDFHelper");

const {
  getCorporationService,
} = require("../../MenuAccess/MenuAccess.service");

/**
 * ==========================================
 * Validation
 * ==========================================
 */
function validate(body) {
  const { salDate, ulbid, deptid } = body;

  if (!salDate) throw new AppError("Salary Date is required", 400);

  if (!ulbid) throw new AppError("ULB Id is required", 400);

  if (!deptid) throw new AppError("Department Id is required", 400);

  return {
    salDate,
    ulbid,
    deptid,
  };
}

/**
 * ==========================================================
 * Detail Report PDF
 * ==========================================================
 */
exports.downloadDetailReport = asyncHandler(async (req, res) => {

   console.log("=========== DETAIL REPORT ===========");
  console.log("BODY:", req.body);

  const payload = validate(req.body);

  console.log("PAYLOAD:", payload);


  const report = await service.getDetailReportService(payload);

  /**
   * Corporation Details
   */
  let ulbInfo;

  try {
    ulbInfo = await getCorporationService({
      ulbId: payload.ulbid,
    });
  } catch (err) {
    ulbInfo = {
      ULBLOGO: "",
      ABC_MUNICIPAL_TEXT: "नगर परिषद",
    };
  }

  let pdf;

  try {
    pdf = await BillGenerationPDFHelper({
      reportType: "DETAIL",
      reportData: report,
      ulbInfo,
      salDate: payload.salDate,
      department: report.department,
      billNo: report.billNo,
      generatedBy: req.user?.userId || "SYSTEM",
    });
  } catch (err) {
  console.error("========== PDF ERROR ==========");
  console.error("Message :", err.message);
  console.error("Stack :");
  console.error(err.stack);

  return res.status(500).json({
    ok: false,
    error: err.message,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
  });
}

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const pdfUrl = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

  return res.json({
    success: true,
    message: "Bill Detail Report Generated Successfully",
    fileName: pdf.fileName,
    pdfUrl,
  });
});

/**
 * ==========================================================
 * Summary Report PDF
 * ==========================================================
 */
exports.downloadSummaryReport = asyncHandler(async (req, res) => {
  const payload = validate(req.body);

  const report = await service.getSummaryReportService(payload);

  /**
   * Corporation Details
   */
  let ulbInfo;

  try {
    ulbInfo = await getCorporationService({
      ulbId: payload.ulbid,
    });
  } catch (err) {
    ulbInfo = {
      ULBLOGO: "",
      ABC_MUNICIPAL_TEXT: "नगर परिषद",
    };
  }

  const pdf = await BillGenerationPDFHelper({
    reportType: "SUMMARY",

    reportData: report,

    ulbInfo,

    salDate: report.salDate,

    department: report.department,

    billNo: report.billNo,

    generatedBy: req.user?.userId || "SYSTEM",
  });

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const pdfUrl = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

  return res.json({
    success: true,
    message: "Bill Summary Report Generated Successfully",
    fileName: pdf.fileName,
    pdfUrl,
  });
});

exports.generateBill = asyncHandler(async (req, res) => {
  const payload = validate(req.body);

  payload.userId = req.user?.userId || req.body.userId || "SYSTEM";

  const result = await service.insertBillService(payload);

  if (result.errorCode !== 9999) {
    throw new AppError(result.errorMsg, 400);
  }

  return ok(res, {
    message: result.errorMsg,
  });
});
