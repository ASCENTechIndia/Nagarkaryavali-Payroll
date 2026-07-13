const express = require("express");
const router = express.Router();

const controller = require("./FrmSalDeduction.controller");
const auth = require("../../../middlewares/auth.middleware");

// ===============================
// Get Deduction Head List
// ===============================
router.post("/deduction-head-list", auth(), controller.getDeductionHeadList);
router.post("/employee-list", auth(), controller.getEmployeeList);
router.post("/insert", controller.insertSalDeduction);

module.exports = router;
