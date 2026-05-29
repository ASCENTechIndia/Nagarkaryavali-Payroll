const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmBranchConfig.controller");

router.get(
  "/corporationlist",auth(),
  controller.getCorporationList
);

router.post(
  "/branchlist",auth(),
  controller.getBranchList
);

router.post(
  "/configuredbranchlist",auth(),
  controller.getConfiguredBranch
);

router.post(
  "/savebranchconfiguration",auth(),
  controller.saveBranchConfiguration
);

module.exports = router;