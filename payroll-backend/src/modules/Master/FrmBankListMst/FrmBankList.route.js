const express = require("express");

const router = express.Router();

const auth = require("../../../middlewares/auth.middleware");

const controller = require("./FrmBankList.controller");


router.post(
  "/banklist",auth(),
  controller.getBankList
);


router.post(
  "/bankbyid",auth(),
  controller.getBankById
);


router.post(
  "/savebank",auth(),
  controller.saveBank
);

module.exports = router;