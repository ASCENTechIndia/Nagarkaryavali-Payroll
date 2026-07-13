const express = require("express");

const router = express.Router();

const controller = require("./FrmMonthlyBankDeductionUploadAuth.controller");

// ===============================
// Monthly Bank Deduction Authorization List
// ===============================
router.get("/list", controller.getMonthlyBankDeductionAuthList);

router.post("/authdetails", controller.getMonthlyBankDeductionAuthDetails);

module.exports = router;
