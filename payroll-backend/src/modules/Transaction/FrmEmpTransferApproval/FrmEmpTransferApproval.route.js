const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmEmpTransferApproval.controller");

router.post("/transfer-list", auth(),  controller.getEmpTransferList);
router.post("/transfer-types", auth(),  controller.getTransferTypes);
router.post("/transfer-details", auth(),  controller.getEmpTransferDetails);
router.post("/save-transfer", auth(),  controller.saveEmpTransfer);

module.exports = router;
