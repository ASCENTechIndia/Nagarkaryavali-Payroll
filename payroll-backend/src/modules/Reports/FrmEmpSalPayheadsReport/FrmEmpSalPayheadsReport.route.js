const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmEmpSalPayheadsReport.controller");

router.get("/month-list",auth(),controller.getMonthList);
router.get("/year-list",auth(),controller.getYearList);
router.post("/emp-sal-payheads-report",controller.getEmpSalPayheadsReport);

module.exports = router;