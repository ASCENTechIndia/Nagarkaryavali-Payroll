const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmRetiredEmpRpt.controller");

// Generate PDF report
router.post(
  "/generate-retired-employee-pdf",
  auth(),
  controller.generateRetiredEmployeePDF
);

// Generate Excel report
router.post(
  "/generate-retired-employee-excel",
  auth(),
  controller.generateRetiredEmployeeExcel
);

// Get retired employee list
router.post(
  "/retired-employee-list",
  auth(),
  controller.getRetiredEmployeeList
);

module.exports = router;