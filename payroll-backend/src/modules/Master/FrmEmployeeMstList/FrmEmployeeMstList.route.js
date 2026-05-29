const express = require("express");
const router = express.Router();

const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmEmployeeMstList.controller");

router.get( "/employee-category-list", auth(), controller.getEmployeeCategory);
router.post( "/zone-list", auth(), controller.getZoneList);
router.post( "/department-list", auth(), controller.getDepartmentList);
router.post( "/subdepartment-list", auth(), controller.getSubDepartmentList);
router.post( "/employee-search", auth(), controller.searchEmployee);
module.exports = router;