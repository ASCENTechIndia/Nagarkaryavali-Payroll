const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmEmployeeMstNewTest.controller");
const upload = require("../../../middlewares/upload.middleware");

router.post( "/employee-bank-list", auth(), controller.getEmployeeBank);
router.post( "/salary-earning-list", auth(), controller.getSalaryEarning);
router.post( "/salary-deduction-list", auth(), controller.getSalaryDeduction);
router.get( "/grade-list", auth(), controller.getGradeList);
router.post( "/designation-list", auth(), controller.getDesignationList);
router.post( "/payscale-list", auth(), controller.getPayScaleList);
router.get( "/religion-list", auth(), controller.getReligionList);
router.post( "/employee-category-list",  controller.getEmployeeCategory);
router.get( "/festival-list", auth(), controller.getFestivalList);
router.post( "/selection-post-list", auth(), controller.getSelectionPostList);
router.get( "/cast-category-list", auth(), controller.getCastCategoryList);
router.post( "/bank-branch-list", auth(), controller.getBankBranchList);
router.post( "/branch-master-list", auth(), controller.getBranchMasterList);
router.post( "/employee-autofill",  controller.getEmployeeAutoFill);
router.post( "/get-caste-list",  controller.getCasteList);
router.post( "/get-subcaste-list",  controller.getSubCasteList);
router.post( "/save-employee",  controller.saveEmployee);
router.post( "/update-employee-images", 
  upload.fields([
    {name: "BLOBSign",maxCount: 1},
    {name: "BLOBPhoto",maxCount: 1},
    {name: "BLOBThumb",maxCount: 1},
  ]),
  auth(),
  controller.updateEmployeeImages
);

module.exports = router;