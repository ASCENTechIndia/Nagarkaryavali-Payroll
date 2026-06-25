const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmDeductionPayheadsDtls.controller");

router.post("/departments", auth(), controller.getDepartments);
router.post("/payheads-list", auth(), controller.getPayHeadsList);
router.post("/search-deductions", auth(), controller.searchDeductions);
router.post("/generate-pdf", auth(), controller.generateDeductionsPDF);

module.exports = router;