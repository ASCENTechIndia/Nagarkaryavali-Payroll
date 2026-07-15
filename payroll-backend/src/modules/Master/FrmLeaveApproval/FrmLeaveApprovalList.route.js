const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmLeaveApprovalList.controller");


router.post(
  "/pendingleavelist",auth(),
  controller.getPendingLeaveList
);


router.post(
  "/leavetypelist",auth(),
  controller.getLeaveTypeList
);


router.post(
  "/leaveapprovaldetails",auth(),
  controller.getLeaveApprovalDetails
);

router.post("/save", auth(), controller.saveLeaveApproval);

module.exports = router;