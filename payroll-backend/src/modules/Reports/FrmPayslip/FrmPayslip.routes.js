const express = require("express");

const router = express.Router();

const controller = require("./FrmPayslip.controller");

const auth = require("../../../middlewares/auth.middleware");

// ===============================
// Get Employee Details
// ===============================
router.post("/employee-details", controller.getEmployeeDetails);
router.post("/generate-payslip", controller.generatePaySlipPDF);
module.exports = router;
