const express = require("express");
const router = express.Router();

const controller = require("./FrmESevaLoanNAdvance.controller");
const auth = require("../../../middlewares/auth.middleware");
const upload = require("../../../middlewares/upload.middleware");

router.post("/getLoanAdvanceList", auth(), controller.getLoanAdvanceList);

router.post("/insertLoanAndAdvance", auth(), controller.insertLoanAndAdvance);

router.post("/updateLoanAdvanceSignature", upload.single("signature"), controller.updateLoanAdvanceSignature);

module.exports = router;
