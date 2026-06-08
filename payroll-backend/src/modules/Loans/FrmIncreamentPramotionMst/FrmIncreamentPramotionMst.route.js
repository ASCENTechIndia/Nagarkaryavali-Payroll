const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmIncreamentPramotionMst.controller");
const upload = require("../../../middlewares/upload.middleware");

router.post("/employee-list", auth(), controller.getEmployeeList);
router.post("/sub-department-list", auth(), controller.getSubDepartmentList);
router.get("/promotion-list", auth(), controller.getPromotionList);
router.get("/increment-type-list", auth(), controller.getIncrementTypeList);
router.get("/payscale-list", auth(), controller.getPayScaleList);
router.get("/grade-list", auth(), controller.getGradeList);
router.post("/designation-list", auth(), controller.getDesignationList);
router.post("/bill-list", auth(), controller.getBillList);
router.post("/save-increment-promotion", controller.saveIncrementPromotion);
router.post("/update-IncreamentDocument",upload.fields([
    { name: "BLOBDoc", maxCount: 1 },
  ]),
  controller.updateDocument
);

module.exports = router;