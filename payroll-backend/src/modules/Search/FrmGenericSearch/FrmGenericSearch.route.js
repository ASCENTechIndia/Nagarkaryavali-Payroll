const express = require("express")
const router = express.Router()
const controller = require("./FrmGenericSearch.controller")
const auth = require("../../../middlewares/auth.middleware")

router.get("/get-corporation",  controller.getCorporationController)
router.post("/employee-search", controller.getEmployeeSearchController);
module.exports = router