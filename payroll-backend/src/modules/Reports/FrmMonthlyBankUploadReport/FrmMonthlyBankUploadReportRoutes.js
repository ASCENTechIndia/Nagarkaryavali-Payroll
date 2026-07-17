const express = require("express");
const router = express.Router();

const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmMonthlyBankUploadReportController");

router.post(
  "/monthly-bank-upload-report",
  auth(),
  controller.generateMonthlyBankUploadReport
);

module.exports = router;