const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");

const controller = require("./FrmHomepage.controller");

// ===============================
router.post("/department-wise-employee", auth(), controller.getDepartmentWiseEmployee);

// ===============================
router.post("/grade-wise-employee", auth(), controller.getGradeWiseEmployee);

// ===============================
router.post("/department-wise-salary", auth(), controller.getDepartmentWiseSalary);

module.exports = router;
