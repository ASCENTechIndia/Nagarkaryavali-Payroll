const express = require("express");
const router = express.Router();

const controller = require("./FrmBankRecovery.controller");
const auth = require("../../../middlewares/auth.middleware");

// ✅ Month List
router.get("/month-list", auth(), controller.getMonthList);

// ✅ Year List
router.get("/year-list", auth(), controller.getYearList);

// ✅ Bank Recovery List
router.post("/bank-recovery-list", auth(), controller.getBankRecoveryList);

router.post("/save-bank-recovery", auth(), controller.saveBankRecovery);

module.exports = router;
