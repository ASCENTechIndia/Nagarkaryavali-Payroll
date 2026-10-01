const express = require("express");
const router = express.Router();

const controller = require("./FrmEsevaEmpPenalAction.controller");
const auth = require("../../../middlewares/auth.middleware");

router.post("/getActionTypeList", auth(), controller.getActionTypeList);

router.post("/getPensionImpactList", auth(), controller.getPensionImpactList);

// Penal Action Details
router.post("/getPenalActionDetails", auth(), controller.getPenalActionDetails);

// Insert / Update Penal Action
router.post("/insertPenalAction", auth(), controller.insertPenalAction);

module.exports = router;
