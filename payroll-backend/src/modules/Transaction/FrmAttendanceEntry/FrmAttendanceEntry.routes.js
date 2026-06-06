const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmAttendanceEntry.controller");

router.post("/attendance-list", auth(), controller.getAttendanceList);
router.post("/save-attendance", auth(), controller.saveAttendance);

module.exports = router;