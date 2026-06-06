const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmPayrollReport.controller");

router.post("/month-list", auth(), controller.getMonthList);
router.post("/year-list", auth(), controller.getYearList);
router.post("/payroll-report", auth(), controller.getPayrollReport);
router.post("/generate-payroll-pdf", auth(), controller.generatePayrollPDF);

module.exports = router;
