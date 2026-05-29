const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmSalaryCalculation.controller");

router.get( "/employee-list", auth(), controller.getEmployeeList);
router.post( "/bill-list", auth(), controller.getBillList);
router.post( "/calculateSalary", auth(), controller.calculateSalary);
router.post( "/deleteSalary",  controller.deleteSalary );

module.exports = router;