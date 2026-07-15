const express = require("express");
const router = express.Router();

const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmLoansAndAdvancesRpt.controller");

router.post("/loans-advances-search", auth(), controller.searchLoansAdvances);

module.exports = router;