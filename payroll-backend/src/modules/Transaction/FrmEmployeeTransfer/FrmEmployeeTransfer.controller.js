// modules/Transaction/FrmEmployeeTransfer/FrmEmployeeTransfer.controller.js
const service = require("./FrmEmployeeTransfer.service");
const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");

// Department List (Existing)
exports.getDepartmentList = async (req, res) => {
  try {
    //console.log("✅ GET /department-list called");
    const { ulbId } = req.query;

    if (!ulbId) {
      return res.status(400).json({
        success: false,
        message: "ULB ID is required",
      });
    }

    const result = await service.getDepartmentListService(ulbId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch departments",
    });
  }
};

// Designation List (Existing)
exports.getDesignationList = async (req, res) => {
  try {
    console.log("✅ GET /designation-list called");
    const { ulbId } = req.query;

    if (!ulbId) {
      return res.status(400).json({
        success: false,
        message: "ULB ID is required",
      });
    }

    const result = await service.getDesignationListService(ulbId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch designations",
    });
  }
};

// Grade List (Existing)
exports.getGradeList = async (req, res) => {
  try {
    console.log("✅ GET /grade-list called");
    const { ulbId } = req.query;

    if (!ulbId) {
      return res.status(400).json({
        success: false,
        message: "ULB ID is required",
      });
    }

    const result = await service.getGradeListService(ulbId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch grades",
    });
  }
};

// Transfer Types (Existing)
exports.getTransferTypes = async (req, res) => {
  try {
    console.log("✅ GET /transfer-types called");
    const result = await service.getTransferTypesService();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch transfer types",
    });
  }
};

{/*
// ✅ NEW: Get all departments for transfer dropdown
exports.getTransferDepartments = async (req, res) => {
  try {
    console.log("✅ GET /transfer-departments called");
    const { ulbId } = req.query;

    if (!ulbId) {
      return res.status(400).json({
        success: false,
        message: "ULB ID is required",
      });
    }

    const result = await service.getTransferDepartmentsService(ulbId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Error in getTransferDepartments:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch transfer departments",
    });
  }
};

// ✅ NEW: Get all designations for transfer dropdown
exports.getTransferDesignations = async (req, res) => {
  try {
    console.log("✅ GET /transfer-designations called");
    const { ulbId } = req.query;

    if (!ulbId) {
      return res.status(400).json({
        success: false,
        message: "ULB ID is required",
      });
    }

    const result = await service.getTransferDesignationsService(ulbId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Error in getTransferDesignations:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch transfer designations",
    });
  }
};

// ✅ NEW: Get all grades for transfer dropdown
exports.getTransferGrades = async (req, res) => {
  try {
    console.log("✅ GET /transfer-grades called");
    const { ulbId } = req.query;

    if (!ulbId) {
      return res.status(400).json({
        success: false,
        message: "ULB ID is required",
      });
    }

    const result = await service.getTransferGradesService(ulbId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Error in getTransferGrades:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch transfer grades",
    });
  }
};
*/}

// Search Employee
exports.searchEmployee = async (req, res) => {
  try {
    console.log("✅ POST /search-employee called");
    const { empId, ulbId } = req.body;

    if (!empId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    if (!ulbId) {
      return res.status(400).json({
        success: false,
        message: "ULB ID is required",
      });
    }

    const result = await service.searchEmployeeService({ empId, ulbId });
    res.json(result);
  } catch (error) {
    console.error("❌ Error in searchEmployee:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to search employee",
    });
  }
};

// ======================================
// Save Employee Transfer
// ======================================
exports.saveEmployeeTransfer = asyncHandler(async (req, res) => {
  const result = await service.saveEmployeeTransferService(req.body);

  console.log("Controller Result:", result);

  return res.status(200).json({
    success: result.success,
    errorCode: result.errorCode,
    errorMsg: result.errorMsg,
    transferId: result.transferId,
  });
});

// ======================================
// Get Transfer Details
// ======================================
exports.getTransferDetails = asyncHandler(async (req, res) => {
  const result = await service.getTransferDetailsService(req.body);

  return res.status(200).json({
    success: true,
    data: result.rows,
  });
});
