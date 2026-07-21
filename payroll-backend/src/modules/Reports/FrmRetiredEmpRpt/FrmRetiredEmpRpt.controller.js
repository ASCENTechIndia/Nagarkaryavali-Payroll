const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmRetiredEmpRpt.service");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const { RetiredEmployeePDFHelper } = require("../../../utils/pdfHelper/FrmRetiredEmpRpt");
const { getCorporationService } = require("../../MenuAccess/MenuAccess.service");

/**
 * Get retired employee list
 */
exports.getRetiredEmployeeList = asyncHandler(async (req, res) => {
  const {
    ulbid,
    zoneId,
    deptId,
    subDeptId,
    billNo,
    month,
    year
  } = req.body;

  const result = await service.getRetiredEmployeeListService({
    ulbid,
    zoneId,
    deptId,
    subDeptId,
    billNo,
    month,
    year
  });

  return ok(res, result, "Retired employee list fetched successfully");
});

/**
 * Generate Retired Employee PDF Report
 */
exports.generateRetiredEmployeePDF = async (req, res) => {
  try {
    const filters = req.body;

    // Validate required fields
    if (!filters.ulbid) {
      return res.status(400).json({
        success: false,
        message: "ULB ID is required"
      });
    }

    if (!filters.zoneId || filters.zoneId === "0" || filters.zoneId === "-1") {
      return res.status(400).json({
        success: false,
        message: "Please select Zone"
      });
    }

    if (!filters.month || filters.month === "0") {
      return res.status(400).json({
        success: false,
        message: "Please select Month"
      });
    }

    if (!filters.year) {
      return res.status(400).json({
        success: false,
        message: "Please select Year"
      });
    }

    // Get the data
    const result = await service.getRetiredEmployeeListService(filters);

    if (!result || !result.data || result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No records found"
      });
    }

    // Get ULB info
    let ulbInfo = {};
    try {
      ulbInfo = await getCorporationService({
        ulbId: filters.ulbid,
      });
    } catch (err) {
      console.error("Error getting ULB info:", err);
      ulbInfo = {
        ULBLOGO: "",
        ABC_MUNICIPAL_TEXT: "Municipal Corporation",
      };
    }

    // Generate PDF
    const pdf = await RetiredEmployeePDFHelper({
      rows: result.data,
      ulbInfo: ulbInfo,
      filters: filters,
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const pdfUrl = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

    return res.json({
      success: true,
      message: "Retired Employee Report PDF Generated Successfully",
      fileName: pdf.fileName,
      pdfUrl: pdfUrl,
    });

  } catch (error) {
    console.error("=== PDF GENERATION ERROR ===");
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate PDF"
    });
  }
};

module.exports = {
  getRetiredEmployeeList: exports.getRetiredEmployeeList,
  generateRetiredEmployeePDF: exports.generateRetiredEmployeePDF,
};