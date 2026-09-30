const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmESevaEmpPostingRecord.controller");
const upload = require("../../../middlewares/upload.middleware");

router.post("/service-dropdown", auth(), controller.getServiceDropdown);
router.post("/posting-record",   auth(), controller.getPostingRecord);
router.post(
    "/insert-posting-record",
    upload.any(),
    auth(),
    controller.insertPostingRecord
);

module.exports = router;