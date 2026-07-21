const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmRetiredEmpRpt.service");
const path = require("path");
const { RetiredEmployeePDFHelper } = require("../../../utils/pdfHelper/FrmRetiredEmpRpt");
const { getCorporationService } = require("../../MenuAccess/MenuAccess.service");

const getRetiredEmployeeList = async (req, res) => {
  try {
    const {
      ulbid,
      zoneId,
      deptId,
      subDeptId,
      billNo,
      month,
      year
    } = req.body;

    console.log("GetRetiredEmployeeList called with:", { ulbid, zoneId, deptId, subDeptId, billNo, month, year });

    if (!ulbid) {
      return res.status(400).json({
        ok: false,
        message: "ULB ID is required"
      });
    }

    if (!zoneId || zoneId === "0" || zoneId === "-1") {
      return res.status(400).json({
        ok: false,
        message: "Please select Zone"
      });
    }

    if (!month || month === "0") {
      return res.status(400).json({
        ok: false,
        message: "Please select Month"
      });
    }

    if (!year) {
      return res.status(400).json({
        ok: false,
        message: "Please select Year"
      });
    }

    const result = await service.getRetiredEmployeeListService({
      ulbid,
      zoneId,
      deptId,
      subDeptId,
      billNo,
      month,
      year
    });

    return res.json({
      ok: true,
      message: result.count > 0 ? "Retired employee list fetched successfully" : "No records found",
      data: result
    });

  } catch (error) {
    console.error("=== ERROR IN getRetiredEmployeeList ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      ok: false,
      error: error.message || "Internal Server Error"
    });
  }
};

const generateRetiredEmployeePDF = async (req, res) => {
  try {
    const filters = req.body;
    console.log("PDF Generation Request:", filters);

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

    const result = await service.getRetiredEmployeeListService(filters);

    if (!result || !result.data || result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No records found for the selected criteria"
      });
    }

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

    let departmentName = "-- ALL --";
    if (filters.deptId && filters.deptId !== "-1" && result.data.length > 0) {
      departmentName = result.data[0].department || "-- ALL --";
    }

    const pdf = await RetiredEmployeePDFHelper({
      rows: result.data,
      ulbInfo: ulbInfo,
      filters: {
        ...filters,
        departmentName: departmentName,
      },
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
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate PDF"
    });
  }
};

module.exports = {
  getRetiredEmployeeList,
  generateRetiredEmployeePDF
};