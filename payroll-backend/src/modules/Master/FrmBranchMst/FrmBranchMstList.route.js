const express = require("express");

const router = express.Router();

const controller = require("./FrmBranchMstList.controller");

const auth = require("../../../middlewares/auth.middleware");


router.post(
  "/banklistBnh",auth(),
  controller.getBankList
);



router.post(
  "/branchlist",auth(),
  controller.getBranchList
);


router.post(
  "/branchbyid",auth(),
  controller.getBranchById
);


router.post(
  "/savebranch",auth(),
  controller.saveBranch
);

module.exports = router;