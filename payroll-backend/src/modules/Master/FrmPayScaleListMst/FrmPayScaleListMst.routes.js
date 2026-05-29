const express = require("express");
const router = express.Router();

const controller = require("./FrmPayScaleListMst.controller");
const auth = require("../../../middlewares/auth.middleware");

// ✅ Get PayScale List
router.post("/payscale-list", auth(), controller.getPayScaleList);

// ✅ Get PayScale By Id
router.post("/payscale-details", auth(), controller.getPayScaleById);

// ✅ Save / Update / Delete PayScale
router.post("/save-payscale", auth(), controller.savePayScale);

module.exports = router;
