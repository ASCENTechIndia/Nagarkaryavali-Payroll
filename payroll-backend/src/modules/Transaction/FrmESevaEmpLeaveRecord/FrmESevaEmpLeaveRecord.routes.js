const express = require("express");
const router = express.Router();

const controller = require("./FrmESevaEmpLeaveRecord.controller");
const auth = require("../../../middlewares/auth.middleware");

router.post("/getESevaEmpLeaveRecord", controller.getESevaEmpLeaveRecord);

router.post("/getLeaveTakenAndEarned", controller.getLeaveTakenAndEarned);

router.post("/getLeaveDetails2", controller.getLeaveDetails2);

router.post("/getFinalLeaveDetails", controller.getFinalLeaveDetails);

router.post("/getLeaveAvailability", controller.getLeaveAvailability);

router.post("/insert-leave-record", controller.insertLeaveRecord);

module.exports = router;
