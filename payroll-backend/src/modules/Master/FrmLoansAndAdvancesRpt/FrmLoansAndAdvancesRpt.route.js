const express = require("express");
const router = express.Router();

const controller = require("./FrmLoansAndAdvancesRpt.controller");
const auth = require("../../../middlewares/auth.middleware");

router.post("/LoanAdvancesRpt", auth(),controller.getLoanAndAdvancesRpt);
router.post("/employeeCodes", auth(), controller.getEmployeeCodes);

module.exports = router;