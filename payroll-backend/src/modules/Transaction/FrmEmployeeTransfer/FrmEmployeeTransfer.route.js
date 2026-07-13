// modules/Transaction/FrmEmployeeTransfer/FrmEmployeeTransfer.route.js
const express = require("express");
const router = express.Router();
const controller = require("./FrmEmployeeTransfer.controller");

// GET endpoints - Existing
router.get("/department-list", controller.getDepartmentList);
router.get("/designation-list", controller.getDesignationList);
router.get("/grade-list", controller.getGradeList);
router.get("/transfer-types", controller.getTransferTypes);

// ✅ NEW: Get all data for transfer dropdowns
router.get("/transfer-departments", controller.getTransferDepartments);
router.get("/transfer-designations", controller.getTransferDesignations);
router.get("/transfer-grades", controller.getTransferGrades);

// POST endpoints
router.post("/search-employee", controller.searchEmployee);
router.post("/save-transfer", controller.saveEmployeeTransfer);
router.post("/transfer-details", controller.getTransferDetails);

module.exports = router;