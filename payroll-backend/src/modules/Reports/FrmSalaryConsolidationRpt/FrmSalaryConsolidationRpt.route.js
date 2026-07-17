const express = require("express");
const router = express.Router();

const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmSalaryConsolidationRpt.controller");

router.post(
  "/salary-consolidation-report",
  auth(),
  controller.getSalaryConsolidationReport
);

module.exports = router;