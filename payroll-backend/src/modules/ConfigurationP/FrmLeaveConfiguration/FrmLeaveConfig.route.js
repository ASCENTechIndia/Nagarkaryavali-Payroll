const express = require("express");
const router = express.Router();
const controller = require("./FrmLeaveConfig.controller");
const auth = require("../../../middlewares/auth.middleware");

router.post(
  "/configuredleavelist",auth(),
  controller.getConfiguredLeave
);

router.post(
  "/leavelist",auth(),
  controller.getLeaveList
);

router.post(
  "/saveleaveconfiguration",auth(),
  controller.saveLeaveConfiguration
);

module.exports = router;