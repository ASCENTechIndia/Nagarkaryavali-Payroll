const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmDesignationWiseEmployeeCountReport.controller");

router.post("/department-list", auth(), controller.getDepartmentList);
router.post("/report-data",     auth(), controller.getReport);
router.post("/generate-pdf",    auth(), controller.generatePdf);

module.exports = router;
