const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmESevaEmpNomin.controller");

router.post("/accounthead-dropdown", auth(), controller.getAccountHeadDropdown);
router.post("/nomination-data", auth(), controller.getNominationData);
router.post("/insert-nomination", auth(), controller.insertNomination);

module.exports = router;