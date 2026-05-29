const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller =require("./FrmPayScaleConfig.controller");

router.post(
  "/payscalelist", auth(),
  controller.getPayScaleList
);

router.post(
  "/configuredpayscalelist",auth(),
  controller.getConfiguredPayScale
);

router.post(
  "/savepayscaleconfiguration",auth(),
  controller.savePayScaleConfiguration
);
module.exports = router;