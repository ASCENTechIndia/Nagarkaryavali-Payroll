const express = require("express");
const router = express.Router();

const controller = require("./FrmDesignationConfig.controller");
const auth = require("../../../middlewares/auth.middleware");

// Get corporation/ULB list
router.get("/corporation-list", auth(), controller.getCorporationList);

// Get designation data for a ULB
router.post("/get-designation-data", auth(), controller.getDesignationData);

// Get existing designation configurations i.e already selected data
router.post("/get-designation-config", auth(), controller.getDesignationConfig);

// Save designation configuration 
router.post("/save-designation-config", auth(), controller.saveDesignationConfig);

module.exports = router;