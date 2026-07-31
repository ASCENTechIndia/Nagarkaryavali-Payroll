const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const controller = require("./FrmHomepage.controller");

router.post("/department-wise-employee", auth(), controller.getDepartmentWiseEmployee);
router.post("/grade-wise-employee", auth(), controller.getGradeWiseEmployee);
router.post("/department-wise-salary", auth(), controller.getDepartmentWiseSalary);
router.get("/designation", auth(), controller.getDesignationController);
router.get("/department", auth(), controller.getDepartmentController);
router.get("/employee", controller.getEmployeeController);

module.exports = router;
