const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmEmployeeRetire.controller");
const upload = require("../../../middlewares/upload.middleware");

router.post("/retirement-reasons", auth(), controller.getRetirementReasons);
router.post("/departments", auth(), controller.getDepartments);
router.post("/sub-departments", auth(), controller.getSubDepartments);
router.post("/employees", auth(), controller.getEmployees);

router.post("/save", auth(), upload.single('file'), controller.saveRetirement);

module.exports = router;