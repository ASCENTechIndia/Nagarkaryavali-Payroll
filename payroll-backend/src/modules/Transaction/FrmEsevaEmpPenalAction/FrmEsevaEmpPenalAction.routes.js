const express = require("express");
const router = express.Router();

const controller = require("./FrmEsevaEmpPenalAction.controller");
const auth = require("../../../middlewares/auth.middleware");

router.post("/getActionTypeList", controller.getActionTypeList);

router.post("/getPensionImpactList", controller.getPensionImpactList);

// Penal Action Details
router.post("/getPenalActionDetails", controller.getPenalActionDetails);

// Insert / Update Penal Action
router.post("/insertPenalAction", controller.insertPenalAction);

module.exports = router;
