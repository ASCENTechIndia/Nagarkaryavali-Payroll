const express = require("express");

const router = express.Router();

const auth = require("../../../middlewares/auth.middleware");

const controller = require("./FrmCastMstList.controller");


router.get(
  "/castlist",auth(),
  controller.getCastList
);

router.post(
  "/castbyid",auth(),
  controller.getCastById
);


router.post(
  "/savecast",auth(),
  controller.saveCast
);

module.exports = router;