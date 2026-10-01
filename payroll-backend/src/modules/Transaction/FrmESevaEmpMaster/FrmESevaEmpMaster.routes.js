const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmESevaEmpMaster.controller");

router.post("/nationality-dropdown", auth(), controller.getNationalityDropdown);
router.post("/religion-dropdown", auth(), controller.getReligionDropdown);
router.post("/category-dropdown", auth(), controller.getCategoryDropdown);
router.post("/bloodgroup-dropdown", auth(), controller.getBloodGroupDropdown);
router.post("/relation-dropdown", auth(), controller.getRelationDropdown);
router.post("/caste-dropdown", auth(), controller.getCasteDropdown);
router.post("/subcaste-dropdown", auth(), controller.getSubCasteDropdown);
router.post("/eSeva-EmpID", auth(), controller.getNewEsevaEmpId);
router.post("/employee-def", auth(), controller.getEmployeeDef);
router.post("/eseva-emp-details", auth(), controller.getEsevaEmpDetails);
router.post("/insert-eseva-emp", auth(), controller.insertEsevaEmp);

module.exports = router;