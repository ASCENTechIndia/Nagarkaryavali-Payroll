const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmLeaveListMst.controller");


router.post(
  "/leavelist",auth(),
  controller.getLeaveList
);


router.post(
  "/leavebyid",auth(),
  controller.getLeaveById
);


router.post(
  "/saveleave",auth(),
  controller.saveLeave
);

module.exports = router;