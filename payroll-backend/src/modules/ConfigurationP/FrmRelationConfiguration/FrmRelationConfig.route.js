const express = require("express");
const router = express.Router();
const controller = require("./FrmRelationConfig.controller");
const auth = require("../../../middlewares/auth.middleware");

router.post(
  "/relationlist", auth(),
  controller.getRelationList
);

router.post(
  "/configrelationlist",auth(),
  controller.getConfiguredRelation
);

router.post(
  "/saverelationconfig",auth(),
  controller.saveRelationConfiguration
);

module.exports = router;