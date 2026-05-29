const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmEmpLeaveList.controller");



router.post(
  "/employeeleavebalancelist",auth(),
  controller.getEmployeeLeaveBalance
);
router.post(
  "/saveemployeeleavebalance",auth(),
  controller.saveEmployeeLeaveBalance
);
module.exports = router;