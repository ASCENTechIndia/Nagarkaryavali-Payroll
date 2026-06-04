const express = require("express")
const router = express.Router()
const controller = require("./RptLeaveStatus.controller")
const auth = require("../../../middlewares/auth.middleware");

router.get("/leave-type", auth(), controller.leaveTypeController)
router.post("/leave-report-list", auth(),  controller.getLeaveReport);

module.exports = router