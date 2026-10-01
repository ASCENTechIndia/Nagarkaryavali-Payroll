const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmAttendenceExcellAuthListMst.controller");

router.post("/attendance-summary", auth(), controller.getAttendanceSummary);

router.post("/attendance-detail", auth(), controller.getAttendanceDetail);

router.post("/attendance-action", auth(), controller.manageAttendance);

module.exports = router;
