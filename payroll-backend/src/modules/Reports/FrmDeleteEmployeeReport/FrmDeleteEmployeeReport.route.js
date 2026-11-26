const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmDeleteEmployeeReport.controller");

router.post("/department-list", auth(), controller.getDepartmentList);
router.post("/billno-list",     auth(), controller.getBillNoList);
router.post("/report-data",     auth(), controller.getReportData);
router.post("/generate-pdf",    auth(), controller.generatePdf);

module.exports = router;
