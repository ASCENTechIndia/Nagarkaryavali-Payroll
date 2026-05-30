const express = require("express");
const auth = require("../../../middlewares/auth.middleware");
const router = express.Router();
const controller = require("./FrmReligionConfig.controller");

router.post(
  "/religionlist", auth(),
  controller.getReligionList
);

router.post(
  "/configreligionlist",auth(),
  controller.getConfiguredReligion
);

router.post(
  "/savereliconfig",auth(),
  controller.saveReligionConfiguration
);

module.exports = router;