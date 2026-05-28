const express = require("express");
const router = express.Router();

const controller = require("./FrmDesgListMst.controller");
const auth = require("../../../middlewares/auth.middleware");

// ✅ Get Designation List
router.get("/designation-list", auth(), controller.getDesignationList);
// ✅ Search Designation List
router.post("/designation-search", auth(), controller.searchDesignationList);
// ✅ Get Designation Details By Id
router.post("/designation-details", auth(), controller.getDesignationDetailsById);
// ✅ Save / Update / Delete Designation
router.post("/save-designation", auth(), controller.saveDesignation);

module.exports = router;
