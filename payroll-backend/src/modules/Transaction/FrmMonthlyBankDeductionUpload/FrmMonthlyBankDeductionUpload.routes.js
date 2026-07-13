const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../../../middlewares/auth.middleware");

const controller = require("./FrmMonthlyBankDeductionUpload.controller");

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post("/pay-head-list", auth(), controller.getPayHeadList);

router.post("/department-list", auth(), controller.getDepartmentList);

router.get("/year-list", auth(), controller.getYearList);

router.post("/download-excel", auth(), controller.getMonthlyBankDeductionExcelData);

// ===============================
router.post("/upload-excel", upload.single("file"), auth(), controller.uploadMonthlyBankDeduction);

router.post("/submit", auth(), controller.submitMonthlyBankDeduction);

module.exports = router;

//---------------------------FRONTEND--------------------

// const formData = new FormData();

// formData.append("file", file);

// formData.append("userId", userId);
// formData.append("month", month);
// formData.append("year", year);

// await axios.post(
//   "/api/FrmMonthlyBankDeductionUpload/upload-excel",
//   formData,
//   {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   }
// );
