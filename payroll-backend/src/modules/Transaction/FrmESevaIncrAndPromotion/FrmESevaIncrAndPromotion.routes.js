const express = require("express");
const router = express.Router();

const controller = require("./FrmESevaIncrAndPromotion.controller");
const auth = require("../../../middlewares/auth.middleware");

router.post("/getIncrementList", auth(), controller.getIncrementList);

router.post("/getPromotionList", auth(), controller.getPromotionList);

router.post("/insertIncrementAndPromotion", auth(), controller.insertIncrementAndPromotion);

module.exports = router;
