const express = require("express");
const router = express.Router();
const controller = require("./FrmEmployeeDtls.controller");
const auth = require("../../../middlewares/auth.middleware");

router.post("/employee-details", controller.getEmployeeDetailsController);

module.exports = router;