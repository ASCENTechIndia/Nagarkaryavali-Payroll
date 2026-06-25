const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmEmpTransferApproval.controller");

router.post("/transfer-list",  controller.getEmpTransferList);
router.post("/transfer-types",  controller.getTransferTypes);
router.post("/transfer-details",  controller.getEmpTransferDetails);
router.post("/save-transfer",  controller.saveEmpTransfer);

module.exports = router;
