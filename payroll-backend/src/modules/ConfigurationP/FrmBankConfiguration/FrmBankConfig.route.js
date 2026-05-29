const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmBankConfig.controller");

router.post(
  "/configuredbanklist",auth(),
  controller.getConfiguredBank
);

router.post(
  "/banklist",auth(),
  controller.getBankList
);

router.post(
  "/savebankconfiguration",auth(),
  controller.saveBankConfiguration
);

module.exports = router;