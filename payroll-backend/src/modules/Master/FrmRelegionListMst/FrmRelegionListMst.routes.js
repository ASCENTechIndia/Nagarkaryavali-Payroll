const express = require("express");
const router = express.Router();

const controller = require("./FrmRelegionListMst.controller");
const auth = require("../../../middlewares/auth.middleware");

// ✅ Get Religion List
router.get("/religion-list", auth(), controller.getReligionList);
// ✅ Get Religion Details By Id
router.post("/religion-details", controller.getReligionDetailsById);
// ✅ Save / Update / Delete Religion
router.post("/save-religion",  controller.saveReligion);

module.exports = router;
