const express = require("express");

const router = express.Router();

const controller = require("./FrmAttendenceEntryDMC.controller");

router.post(
    "/attendance-list",
    controller.getAttendanceList
);

router.post(
    "/save-attendance",
    controller.saveAttendance
);

router.post("/year-list", controller.getYearList);

module.exports = router;