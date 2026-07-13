const express = require("express")
const router = express.Router()
const controller = require("./FrmEmployeeDtls.controller")
const auth = require("../../../middlewares/auth.middleware")

// Employee details endpoints
router.post("/employee-details", auth(), controller.getEmployeeDetailsController)
//router.post("/employee-images", auth, controller.getEmployeeImagesController)
//router.post("/office-grade-list", auth(), controller.getOfficeGradeListController)

module.exports = router