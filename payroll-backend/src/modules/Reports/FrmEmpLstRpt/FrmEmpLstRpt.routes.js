const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmEmpLstRpt.controller");

router.post("/employee-list", auth(), controller.getEmployeeList);
router.post(
  "/generate-employee-list-pdf",
  auth(),
  controller.generateEmployeeListPDF,
);
router.post(
  "/salary-detail",

  controller.getSalaryDetail,
);

router.post(
  "/employee-sub-detail",

  controller.getEmployeeSubDetail,
);

router.post(
  "/payhead-salary-detail",

  controller.getPayheadSalaryDetail,
);

router.post("/bill-dmc-pdf", auth(), controller.generateBillDmcPDF);

router.post("/summary-report-pdf", auth(), controller.generateSummaryReportPDF);

module.exports = router;
