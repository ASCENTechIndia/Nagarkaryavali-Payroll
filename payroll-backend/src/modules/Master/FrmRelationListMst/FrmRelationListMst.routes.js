const express = require("express");
const router = express.Router();

const controller = require("./FrmRelationListMst.controller");
const auth = require("../../../middlewares/auth.middleware");

// ✅ Get Relation List
router.get("/relation-list",auth(), controller.getRelationList);
// ✅ Get Relation Details By Id
router.post("/relation-details", auth(), controller.getRelationById);

// ✅ Save / Update / Delete Relation
router.post("/save-relation", auth(), controller.saveRelation);

module.exports = router;
