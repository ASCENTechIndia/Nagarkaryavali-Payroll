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

/**
 * Generate Retired Employee Excel Report with xlsx
 */
exports.generateRetiredEmployeeExcel = async (req, res) => {
  try {
    const filters = req.body;
    console.log("Excel Generation Request:", filters);

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

    // Generate Excel buffer with formatting
    const buffer = await generateFormattedExcelBuffer(result.data, filters);

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=RetiredEmployee_${Date.now()}.xlsx`);
    res.setHeader('Content-Length', buffer.length);
    
    // Send the buffer
    return res.send(buffer);

  } catch (error) {
    console.error("=== EXCEL GENERATION ERROR ===");
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate Excel"
    });
  }
};

/**
 * Generate formatted Excel with borders and bold headers using xlsx
 */
async function generateFormattedExcelBuffer(data, filters) {
  // Determine ULB type for column adjustments
  const isSpecialUlb = ["930", "1750"].includes(filters.ulbid?.toString());
  const isUlb770 = filters.ulbid?.toString() === "770";

  // Prepare data for Excel
  let excelData = [];

  // Define headers and keys based on ULB type
  let headers = [];
  let keys = [];

  if (isSpecialUlb) {
    headers = [
      "Bill No.",
      "Employee Id",
      "Name",
      "Retire Date",
      "Department",
      "Type",
      "GRADE",
      "DOB",
      "DESIGNATION",
      "SUBDEPT",
      "Old Slip No.",
      "New Slip No."
    ];
    keys = [
      "billno",
      "oldslipno",
      "name",
      "retiredate",
      "department",
      "type",
      "grade",
      "dob",
      "designation",
      "subdept",
      "oldslipno",
      "newslipno"
    ];
  } else if (isUlb770) {
    headers = [
      "Employee Id",
      "Name",
      "Retire Date",
      "Department",
      "Type",
      "GRADE",
      "DOB",
      "DESIGNATION",
      "SUBDEPT"
    ];
    keys = [
      "oldempno",
      "name",
      "retiredate",
      "department",
      "type",
      "grade",
      "dob",
      "designation",
      "subdept"
    ];
  } else {
    headers = [
      "Employee Id",
      "Name",
      "Retire Date",
      "Department",
      "Type",
      "GRADE",
      "DOB",
      "DESIGNATION",
      "SUBDEPT"
    ];
    keys = [
      "oldslipno",
      "name",
      "retiredate",
      "department",
      "type",
      "grade",
      "dob",
      "designation",
      "subdept"
    ];
  }

  // Add headers as first row
  excelData.push(headers);

  // Add data rows
  data.forEach(row => {
    const rowData = [];
    keys.forEach(key => {
      let value = row[key] || "";
      if (typeof value === 'string') {
        value = value.trim();
      }
      rowData.push(value);
    });
    excelData.push(rowData);
  });

  // Create workbook
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  // =============================================
  // APPLY FORMATTING USING XLSX
  // =============================================
  
  // Set column widths
  const colWidths = headers.map((header, index) => {
    let maxLength = header.length;
    data.forEach(row => {
      const key = keys[index];
      const value = row[key] ? String(row[key]).length : 0;
      if (value > maxLength) {
        maxLength = Math.min(value, 30);
      }
    });
    return { wch: Math.max(maxLength + 2, 12) };
  });
  worksheet['!cols'] = colWidths;

  // =============================================
  // APPLY STYLES (Borders, Bold, Alignment)
  // =============================================
  
  // Row range
  const totalRows = excelData.length;
  const totalCols = headers.length;

  // Apply styles to all cells
  for (let row = 1; row <= totalRows; row++) {
    for (let col = 1; col <= totalCols; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: col - 1 });
      const cell = worksheet[cellRef];
      
      if (!cell) continue;

      // Initialize styles if not exists
      if (!cell.s) cell.s = {};

      // =============================================
      // BORDER STYLES
      // =============================================
      const borderStyle = {
        top: { style: 'thin', color: { rgb: "000000" } },
        bottom: { style: 'thin', color: { rgb: "000000" } },
        left: { style: 'thin', color: { rgb: "000000" } },
        right: { style: 'thin', color: { rgb: "000000" } }
      };

      // =============================================
      // HEADER ROW - Bold + Background
      // =============================================
      if (row === 1) {
        cell.s.font = { bold: true, sz: 11, name: 'Arial' };
        cell.s.alignment = { horizontal: 'center', vertical: 'center' };
        cell.s.fill = {
          fgColor: { rgb: "E0E0E0" } // Light gray background
        };
        cell.s.border = borderStyle;
      } 
      // =============================================
      // DATA ROWS
      // =============================================
      else {
        // Check if this is the Name column (index 2 for most layouts)
        const isNameColumn = (col === 3); // 3rd column (0-indexed: col-1 = 2)
        
        cell.s.font = { sz: 10, name: 'Arial' };
        cell.s.alignment = {
          horizontal: isNameColumn ? 'left' : 'center',
          vertical: 'center',
          wrapText: true
        };
        cell.s.border = borderStyle;
      }
    }
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Retired Employees");

  // Generate buffer
  return XLSX.write(workbook, { 
    type: 'buffer', 
    bookType: 'xlsx',
    bookSST: false,
    type: 'buffer'
  });
}

module.exports = {
  getRetiredEmployeeList: exports.getRetiredEmployeeList,
  generateRetiredEmployeePDF: exports.generateRetiredEmployeePDF,
  generateRetiredEmployeeExcel: exports.generateRetiredEmployeeExcel
};