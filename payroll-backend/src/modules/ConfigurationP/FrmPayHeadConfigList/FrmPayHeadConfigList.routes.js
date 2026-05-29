const express = require("express");
const router = express.Router();

const controller = require("./FrmPayHeadConfigList.controller");
const auth = require("../../../middlewares/auth.middleware");

router.post("/payheaddll", auth(), controller.getPayHeadList);

router.post("/payheadconfig-list", auth(), controller.getPayHeadConfigList);

router.post("/payheadmst-dropdown", auth(), controller.getPayHeadDropdown);

router.post("/payhead-config-details", auth(), controller.getPayHeadConfigDetails);

router.post("/save-payhead-config", auth(), controller.savePayHeadConfig);

module.exports = router;
