
const express = require("express");
const router = express.Router();

const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmDeptBillSummary.controller");

router.post("/summary-head-wise-salary", auth(), controller.getSummaryHeadWiseSalary);

router.post("/department-payhead-summary", auth(), controller.getDepartmentPayheadSummary);

router.post("/payhead-master", auth(), controller.getPayheadMaster);

router.post("/generate-pdf", controller.generateDeptBillSummaryPDF);

module.exports = router;
