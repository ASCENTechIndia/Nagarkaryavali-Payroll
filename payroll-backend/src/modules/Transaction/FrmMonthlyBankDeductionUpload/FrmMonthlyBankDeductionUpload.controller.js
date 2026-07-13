const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmMonthlyBankDeductionUpload.service");

// ===============================
// Get Pay Head List
// ===============================
const getPayHeadList = asyncHandler(async (req, res) => {
  const { ulbId } = req.body;

  const result = await service.getPayHeadList(ulbId);

  res.status(200).json({
    success: true,
    message: "Pay Head List fetched successfully.",
    data: result.rows,
  });
});

// Get Department List
const getDepartmentList = asyncHandler(async (req, res) => {
  const { ulbId } = req.body;

  const result = await service.getDepartmentList(ulbId);

  res.status(200).json({
    success: true,
    message: "Department List fetched successfully.",
    data: result.rows,
  });
});

// ===============================
// Get Year List
// ===============================
const getYearList = asyncHandler(async (req, res) => {
  const result = await service.getYearList();

  res.status(200).json({
    success: true,
    message: "Year List fetched successfully.",
    data: result.rows,
  });
});

const getMonthlyBankDeductionExcelData = asyncHandler(async (req, res) => {
  const result = await service.getMonthlyBankDeductionExcelData(req.body);

  return res.status(200).json({
    success: true,
    message: "Data fetched successfully.",
    data: result.rows,
  });
});

// const uploadMonthlyBankDeduction = asyncHandler(async (req, res) => {
//   const result = await service.uploadMonthlyBankDeduction(
//     req.file,
//     req.body
//   );

//   if (!result.success) {
//     return res.status(400).json(result);
//   }

//   return res.status(200).json(result);
// });

const uploadMonthlyBankDeduction = asyncHandler(async (req, res) => {
  const result = await service.uploadMonthlyBankDeduction(req.file);

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);
});


const submitMonthlyBankDeduction = asyncHandler(async (req, res) => {
  const result = await service.submitMonthlyBankDeduction(req.body);

  return res.status(200).json(result);
});


module.exports = {
  getPayHeadList,
  getDepartmentList,
  getYearList,
  getMonthlyBankDeductionExcelData,
  uploadMonthlyBankDeduction,
  submitMonthlyBankDeduction
};
