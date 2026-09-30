const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmEsevaEmpList.controller");

router.get("/employee-stage",controller.getEmployeeStage);
router.get("/employee-list",controller.getEmployeeList);

module.exports = router;