const express = require("express")
const router = express.Router()
const controller = require("./FrmBankLoanMstList.controller")
const auth = require("../../../middlewares/auth.middleware")

router.post("/ulbWise-employeeList", auth(), controller.getULBwiseEmployeeController)
router.post("/getPayheads", auth(), controller.getPayHeadController)
router.post("/bank-loan-list", auth(), controller.getBankLoanList);

module.exports = router