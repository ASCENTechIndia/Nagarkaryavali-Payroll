const express = require("express");
const router = express.Router();

const controller = require("./FrmPayCommissionListMst.controller");
const auth = require("../../../middlewares/auth.middleware");

// ✅ Get Pay Commission List
router.get("/paycommission-list", auth(), controller.getPayCommissionList);
// ✅ Get Pay Commission Details By Id
router.post("/paycommission-details", auth(), controller.getPayCommissionById);
// ✅ Save / Update Pay Commission
router.post("/save-paycommission", auth(), controller.savePayCommission);

module.exports = router;
