const express = require("express");
const router = express.Router();

const auth = require("../../../middlewares/auth.middleware");

const controller = require("./FrmDeptConfig.controller");

router.get(
  "/departmentlist/:ulbId",
  auth(),
  controller.getDepartmentList
);

router.get(
  "/configureddepartments/:ulbId",
  auth(),
  controller.getConfiguredDepartments
);

router.post(
  "/deptconfsave",
  auth(),
  controller.saveDepartmentConfiguration
);

module.exports = router;