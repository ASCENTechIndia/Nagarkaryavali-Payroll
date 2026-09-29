const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmESevaEmpEducationalInformation.controller");

router.post("/education-info", auth(), controller.getEducationalInfo);
router.post("/additional-training", auth(), controller.getAdditionalTraining);
router.post("/professional-training", auth(), controller.getProfessionalTraining);
router.post("/insert-education-info", auth(), controller.insertEducationalInfo);

module.exports = router;