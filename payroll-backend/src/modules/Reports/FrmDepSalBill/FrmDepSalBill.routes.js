const express = require("express");

const router = express.Router();

const auth = require("../../../middlewares/auth.middleware");

const controller = require("./FrmDepSalBill.controller");

router.post("/department-salary-bill-excel", auth(), controller.getDeptSalBillExcel);
router.post("/department-salary-bill-pdf", auth(), controller.getDeptSalBillPDF);


module.exports = router;
