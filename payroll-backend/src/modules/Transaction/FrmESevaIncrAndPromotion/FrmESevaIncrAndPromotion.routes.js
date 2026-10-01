const express = require("express");
const router = express.Router();

const controller = require("./FrmESevaIncrAndPromotion.controller");
const auth = require("../../../middlewares/auth.middleware");

router.post("/getIncrementList", controller.getIncrementList);

router.post("/getPromotionList", controller.getPromotionList);

router.post("/insertIncrementAndPromotion", controller.insertIncrementAndPromotion);

module.exports = router;
