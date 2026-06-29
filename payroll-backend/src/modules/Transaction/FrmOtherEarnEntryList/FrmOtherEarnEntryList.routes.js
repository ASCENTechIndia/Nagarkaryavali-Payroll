const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmOtherEarnEntryList.controller");

router.post("/earning-list", auth(), controller.getOtherEarningList);
router.post("/earning-head-list", auth(), controller.getEarningHeadList);
router.post("/employee-list", auth(), controller.getEmployeeList);
router.post("/employee-details", auth(), controller.getEmployeeDetails);
router.post("/get-edit-record", auth(), controller.getEditRecord);
router.post("/save-other-earning", auth(), controller.saveOtherEarning);

module.exports = router;