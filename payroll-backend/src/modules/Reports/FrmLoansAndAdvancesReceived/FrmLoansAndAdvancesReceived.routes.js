const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmLoansAndAdvancesReceived.controller");

router.post("/payheads-list", auth(), controller.getPayHeadsList);
router.post("/search-loans-advances", auth(), controller.searchLoansAdvances);
router.post("/generate-pdf", auth(), controller.generateLoansAdvancesPDF);

module.exports = router;