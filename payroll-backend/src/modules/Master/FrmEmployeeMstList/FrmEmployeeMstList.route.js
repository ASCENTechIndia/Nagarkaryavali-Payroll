const express = require("express");
const router = express.Router();

const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmEmployeeMstList.controller");

router.get( "/employee-category-list",  controller.getEmployeeCategory);
router.post( "/zone-list",  controller.getZoneList);
router.post( "/department-list",  controller.getDepartmentList);
router.post( "/subdepartment-list",  controller.getSubDepartmentList);
router.post( "/employee-search",  controller.searchEmployee);
module.exports = router;