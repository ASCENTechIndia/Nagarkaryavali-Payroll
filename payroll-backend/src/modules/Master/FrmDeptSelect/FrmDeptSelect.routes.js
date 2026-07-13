const express = require("express");
const router = express.Router();

const controller = require("./FrmDeptSelect.controller");
const auth = require("../../../middlewares/auth.middleware");

router.post("/list", auth(), controller.getDeptSelectList);

router.post("/department-order", auth(), controller.getDepartmentOrder);

router.post("/designation-list", auth(), controller.getDesignationList);

router.post(
  "/existing-designation-order",
  auth(),
  controller.getExistingDesignationOrder,
);

router.post("/save", auth(), controller.saveDepartmentOrder);

module.exports = router;
