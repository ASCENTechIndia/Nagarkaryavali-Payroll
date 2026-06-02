const express =  require("express")
const router = express.Router()
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmOTherEarnEntryRpt.controller")

router.get("/empoyee-list",  controller.getEmployeeController());
router.post("/earn-entry-report",  controller.getEarnEntryController());

module.exports = router