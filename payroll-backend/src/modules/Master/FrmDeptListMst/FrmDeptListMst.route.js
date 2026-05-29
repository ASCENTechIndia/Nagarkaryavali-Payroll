const express = require("express");
const router = express.Router();

const controller = require("./FrmDeptListMst.controller");
const auth = require("../../../middlewares/auth.middleware");

router.get("/department-list", auth(), controller.getDepartmentList);

router.post("/department-search", auth(), controller.searchDepartmentList);

router.post("/department-details", auth(), controller.getDepartmentDetailsById);

router.post("/save-department", auth(), controller.saveDepartment);

module.exports = router;
