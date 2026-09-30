const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmESevaDashboard.controller");

router.post("/vibhag-dashboard", auth(), controller.getVibhagDashboard);
router.post("/employee-list",    auth(), controller.getEmployeeList);
router.post("/generate-pdf",     auth(), controller.generatePdf);

module.exports = router;