const express = require("express");
const router = express.Router();

const controller = require("./FrmESevaLoanNAdvance.controller");
const auth = require("../../../middlewares/auth.middleware");

router.post("/getLoanAdvanceList", controller.getLoanAdvanceList);

router.post("/insertLoanAndAdvance", controller.insertLoanAndAdvance);

module.exports = router;
