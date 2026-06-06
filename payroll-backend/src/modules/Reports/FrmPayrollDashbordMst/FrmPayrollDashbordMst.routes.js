const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmPayrollDashbordMst.controller");

router.post("/departments", auth(), controller.getDepartmentList);
router.post("/designations", auth(), controller.getDesignationList);
router.post("/employees", auth(), controller.getEmployeeDetails);

module.exports = router;