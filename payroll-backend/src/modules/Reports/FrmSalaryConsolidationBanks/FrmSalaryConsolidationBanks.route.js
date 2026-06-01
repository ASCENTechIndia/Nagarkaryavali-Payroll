const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmSalaryConsolidationBanks.controller");

router.post( "/salary-consolidation-bank-report", auth(),  controller.getSalaryConsolidationBankReport );

module.exports = router;