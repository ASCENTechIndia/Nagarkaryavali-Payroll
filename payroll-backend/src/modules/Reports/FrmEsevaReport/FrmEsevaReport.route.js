const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmEsevaReport.controller");

router.post("/search-employee", auth(), controller.searchEmployee);
router.post("/generate-report", auth(), controller.generateEsevaReport);

module.exports = router;