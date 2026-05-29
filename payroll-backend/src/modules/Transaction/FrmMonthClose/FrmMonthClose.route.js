const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmMonthClose.controller");

router.post( "/month-close", controller.monthClose);

module.exports = router;