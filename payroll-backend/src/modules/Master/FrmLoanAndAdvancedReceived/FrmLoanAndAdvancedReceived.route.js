const express = require("express");
const router = express.Router();

const controller = require("./FrmLoanAndAdvancedReceived.controller");
const auth = require("../../../middlewares/auth.middleware");

router.post("/LoanAdvancesReceived", auth(),controller.getLoanAndAdvancedReceived);

module.exports = router;