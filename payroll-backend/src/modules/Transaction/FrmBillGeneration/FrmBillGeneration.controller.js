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

  if (!salDate)
    throw new AppError("Salary Date is required", 400);

  if (!ulbid)
    throw new AppError("ULB Id is required", 400);

  if (!deptid)
    throw new AppError("Department Id is required", 400);

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
  const payload = validate(req.body);

  const report =
    await service.getDetailReportService(payload);

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

  const pdf =
    await BillGenerationPDFHelper({
      reportType: "DETAIL",
      reportData: report,
      ulbInfo,
    });

  const baseUrl =
    `${req.protocol}://${req.get("host")}`;

  const pdfUrl =
    `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

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

  const report =
    await service.getSummaryReportService(payload);

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

  const pdf =
    await BillGenerationPDFHelper({
      reportType: "SUMMARY",
      reportData: report,
      ulbInfo,
    });

  const baseUrl =
    `${req.protocol}://${req.get("host")}`;

  const pdfUrl =
    `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

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
        message: result.errorMsg
    });

});