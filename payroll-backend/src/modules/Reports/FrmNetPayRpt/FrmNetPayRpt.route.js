const express = require("express");
const router = express.Router();

const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmNetPayRpt.controller");

router.post("/net-pay-report", auth(), controller.generateNetPayReport);
router.post("/vacant-posts-report", auth(), controller.generateVacantPostsReport);

module.exports = router;