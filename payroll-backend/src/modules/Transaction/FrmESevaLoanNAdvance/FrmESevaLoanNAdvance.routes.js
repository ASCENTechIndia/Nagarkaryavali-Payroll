const express = require("express");
const router = express.Router();

const controller = require("./FrmESevaLoanNAdvance.controller");
const auth = require("../../../middlewares/auth.middleware");

router.post("/getLoanAdvanceList", auth(), controller.getLoanAdvanceList);

router.post("/insertLoanAndAdvance", auth(), controller.insertLoanAndAdvance);

module.exports = router;
