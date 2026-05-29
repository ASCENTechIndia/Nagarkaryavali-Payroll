const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmSalaryCalulation.controller");

router.post("/category", auth(), controller.getCategory);
router.post("/department", auth(), controller.getDepartment);
router.post("/subdepartment", auth(), controller.getSubDepartment);
router.post("/billno", auth(), controller.getBillNo);

router.post("/employee-salary-list", auth(), controller.getEmployeeSalaryList);
router.post("/employee-salary-detail", auth(), controller.getEmployeeSalaryDetail);

router.post("/salary-earning", auth(), controller.getSalaryEarning);
router.post("/salary-deduction", auth(), controller.getSalaryDeduction);

router.post("/save-salary", auth(), controller.saveSalaryEdit);

module.exports = router;