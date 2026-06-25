const express = require("express");
const router = express.Router();

const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmLoansAndAdvancesRpt.controller");

router.get("/category-list", auth(), controller.getCategoryList);
router.post("/zone-list", auth(), controller.getZoneList);
router.post("/department-list", auth(), controller.getDepartmentList);
router.post("/employee-list", auth(), controller.getEmployeeList);
router.post("/loans-advances-search", auth(), controller.searchLoansAdvances);

module.exports = router;