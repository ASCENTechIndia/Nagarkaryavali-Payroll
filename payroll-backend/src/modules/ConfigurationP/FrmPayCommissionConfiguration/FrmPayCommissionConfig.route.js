const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmPayCommissionConfig.controller");

router.post(
  "/paycommlist", auth(),
  controller.getPayCommissionList
);

router.post(
  "/configpaycommlist", auth(),
  controller.getConfiguredPayCommission
);

router.post(
  "/savepaycommconfig", auth(),
  controller.savePayCommissionConfiguration
);

module.exports = router;