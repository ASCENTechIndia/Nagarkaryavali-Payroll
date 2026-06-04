const express = require("express")
const router = express.Router()
const controller = require("./RptIncPromotion.controller")
const auth = require("../../../middlewares/auth.middleware")

router.post("/inc-promotion-report",  controller.getIncPromotionReport);

module.exports = router