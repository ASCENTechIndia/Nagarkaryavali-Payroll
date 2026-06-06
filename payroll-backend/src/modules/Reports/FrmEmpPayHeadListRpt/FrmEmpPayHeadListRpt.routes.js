const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmEmpPayHeadListRpt.controller");

router.post("/employee-list", auth(), controller.getEmployeeList);
router.post("/zone-list", auth(), controller.getZoneList);
router.post("/employee-payhead-list", auth(), controller.getEmployeePayHeadList);

module.exports = router;