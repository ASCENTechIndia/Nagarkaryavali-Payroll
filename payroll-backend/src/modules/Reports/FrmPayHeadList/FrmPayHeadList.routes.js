const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmPayHeadList.controller");

router.post("/process", auth(), controller.processReport);

router.post("/pf-fund", auth(), controller.getPFFundReport);
router.post("/income-tax", auth(), controller.getIncomeTaxReport);
router.post("/lic", auth(), controller.getLICReport);
router.post("/excel-gross-tds", auth(), controller.getExcelGrossTDSReport);
router.post("/generate-pdf", auth(), controller.generatePayHeadListPDF);

module.exports = router;