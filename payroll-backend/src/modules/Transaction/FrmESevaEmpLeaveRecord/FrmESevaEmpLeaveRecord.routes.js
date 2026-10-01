const express = require("express");
const router = express.Router();

const controller = require("./FrmESevaEmpLeaveRecord.controller");
const auth = require("../../../middlewares/auth.middleware");

router.post("/getESevaEmpLeaveRecord", auth(), controller.getESevaEmpLeaveRecord);

router.post("/getLeaveTakenAndEarned", auth(), controller.getLeaveTakenAndEarned);

router.post("/getLeaveDetails2", auth(), controller.getLeaveDetails2);

router.post("/getFinalLeaveDetails", auth(), controller.getFinalLeaveDetails);

router.post("/getLeaveAvailability", auth(), controller.getLeaveAvailability);

router.post("/insert-leave-record", auth(), controller.insertLeaveRecord);

router.post("/getLeaveTypeList", auth(), controller.getLeaveTypeList);

router.post("/getLeaveTypeChildList", auth(), controller.getLeaveTypeChildList);

router.post("/getLeaveTypeOtherList", auth(), controller.getLeaveTypeOtherList);

router.post("/getLeaveTypeTEList", auth(), controller.getLeaveTypeTEList);

module.exports = router;
