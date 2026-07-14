const express = require("express");
const router = express.Router();

const auth = require("../../../middlewares/auth.middleware");

const controller = require("./FrmBillGeneration.controller");



router.post(
    "/detail-report",
    auth(),
    controller.downloadDetailReport
);

router.post(
    "/summary-report",
    auth(),
    controller.downloadSummaryReport
);


router.post(
    "/generate-bill",
    auth(),
    controller.generateBill
);


module.exports = router;