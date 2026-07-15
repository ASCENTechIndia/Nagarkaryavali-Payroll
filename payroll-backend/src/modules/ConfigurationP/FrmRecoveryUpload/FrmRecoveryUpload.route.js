const express = require("express");
const router = express.Router();

const controller = require("./FrmRecoveryUpload.controller");
const auth = require("../../../middlewares/auth.middleware");

// Get deduction types list
router.get("/deduction-type-list", auth(), controller.getDeductionTypeList);

// Get recovery list for employee
//router.post("/recovery-list", auth(), controller.getRecoveryList);

// Save recovery (accumulation)
router.post("/save-recovery", auth(), controller.saveRecovery);

router.post("/insert-recovery", controller.insertRecovery);


module.exports = router;