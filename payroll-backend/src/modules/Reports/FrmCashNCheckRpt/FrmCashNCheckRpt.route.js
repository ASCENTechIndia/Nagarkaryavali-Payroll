const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmCashNCheckRpt.controller");

router.post("/department-list", auth(), controller.getDepartmentList);
router.post("/paymode-list",    auth(), controller.getPaymodeList);
router.post("/generate-report", auth(), controller.generateReport);

module.exports = router;
