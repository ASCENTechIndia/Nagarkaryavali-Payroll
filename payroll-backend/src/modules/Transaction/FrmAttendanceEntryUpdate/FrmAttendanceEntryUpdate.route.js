const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmAttendanceEntryUpdate.controller");

router.post("/attendance-entry-list", auth(), controller.getAttendanceEntryUpdate);
router.post("/save-bulk-attendance",  controller.saveBulkAttendance);

module.exports = router;