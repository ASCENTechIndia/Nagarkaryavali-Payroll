const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmPayslip.service");
const path = require("path");

const { PaySlipPDFHelper } = require("../../../utils/pdfHelper/FrmPaySlip.js");

const { getCorporationService } = require("../../MenuAccess/MenuAccess.service");

// ===============================
// Get Employee Details
// ===============================
const getEmployeeDetails = asyncHandler(async (req, res) => {
  const result = await service.getEmployeeDetails(req.body);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Invalid Id, No Employee Record found.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Employee fetched successfully.",
    data: result.rows,
  });
});

//======================================================
// Generate Pay Slip PDF
//======================================================

const generatePaySlipPDF = asyncHandler(async (req, res) => {
  const filters = req.body;

  //----------------------------------------------------
  // Get Report Data
  //----------------------------------------------------

  const result = await service.getPaySlipService(filters);

  //----------------------------------------------------
  // No Record
  //----------------------------------------------------

  if (!result.data || (result.data.reportType === "NORMAL" && result.data.employees.length === 0)) {
    return res.status(404).json({
      success: false,

      message: "No Record Found.",
    });
  }

  //----------------------------------------------------
  // AMC
  //----------------------------------------------------

  if (result.data.reportType === "AMC") {
    return res.status(501).json({
      success: false,

      message: "AMC PDF is not implemented yet.",
    });
  }

  //----------------------------------------------------
  // Corporation Details
  //----------------------------------------------------

  const ulbInfo = await getCorporationService({
    ulbId: filters.ulbId,
  });

  //----------------------------------------------------
  // Generate PDF
  //----------------------------------------------------

  const pdf = await PaySlipPDFHelper({
    employees: result.data.employees,
    leaveDetails: result.data.leaveDetails,
    ulbInfo,
    filters,
    month: req.body.month,
    year: req.body.year,
  });

  //----------------------------------------------------
  // URL
  //----------------------------------------------------

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const pdfUrl = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

  //----------------------------------------------------
  // Response
  //----------------------------------------------------

  return res.json({
    success: true,

    message: "Pay Slip PDF Generated Successfully.",

    fileName: pdf.fileName,

    pdfUrl,
  });
});

module.exports = {
  getEmployeeDetails,
  generatePaySlipPDF,
};
