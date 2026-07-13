const express = require("express");
const router = express.Router();
const multer = require("multer");

const controller = require("./FrmMonthlyBankDeductionUpload.controller");

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post("/pay-head-list", controller.getPayHeadList);

router.post("/department-list", controller.getDepartmentList);

router.get("/year-list", controller.getYearList);

router.post("/download-excel", controller.getMonthlyBankDeductionExcelData);

// ===============================
router.post("/upload-excel", upload.single("file"), controller.uploadMonthlyBankDeduction);

router.post("/submit", controller.submitMonthlyBankDeduction);

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
