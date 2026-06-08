const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmEmpLstRpt.controller");

router.post("/employee-list", auth(), controller.getEmployeeList);
router.post(
  "/generate-employee-list-pdf",
  auth(),
  controller.generateEmployeeListPDF
);

module.exports = router;