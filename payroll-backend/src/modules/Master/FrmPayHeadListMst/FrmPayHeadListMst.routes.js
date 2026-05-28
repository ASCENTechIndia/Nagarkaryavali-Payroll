const express = require("express");
const router = express.Router();

const controller = require("./FrmPayHeadListMst.controller");
const auth = require("../../../middlewares/auth.middleware");

// ✅ Get PayHeads List
router.post("/payheads-list", auth(), controller.getPayHeadsList);
router.get("/paysubheads-list", auth(), controller.getPaySubHeadsList);
router.post("/parent-payheads-list", auth(), controller.getParentPayHeadsList);
router.post("/payhead-details", auth(), controller.getPayHeadDetailsById);
router.post("/save-payhead", auth(), controller.savePayHead);

module.exports = router;
