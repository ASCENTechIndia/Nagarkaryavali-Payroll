const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmBankListReport.controller");

router.post("/department-list",       auth(), controller.getDepartmentList);

router.post("/bank-list",             auth(), controller.getBankList);

router.post("/bank-list-report",      auth(), controller.getBankListReport);

router.post("/generate-bank-list-pdf", auth(), controller.generateBankListPdf);

module.exports = router;
