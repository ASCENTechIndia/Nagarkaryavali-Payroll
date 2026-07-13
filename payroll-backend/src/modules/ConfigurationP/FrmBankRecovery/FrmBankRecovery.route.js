const express = require("express");
const router = express.Router();

const controller = require("./FrmBankRecovery.controller");
const auth = require("../../../middlewares/auth.middleware");

router.get("/month-list", auth(), controller.getMonthList);

router.get("/year-list", auth(), controller.getYearList);

router.post("/bank-recovery-list", auth(), controller.getBankRecoveryList);

router.post("/save-bank-recovery", auth(), controller.saveBankRecovery);

module.exports = router;
