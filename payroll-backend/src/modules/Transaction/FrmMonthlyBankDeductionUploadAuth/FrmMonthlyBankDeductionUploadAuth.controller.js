const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmMonthlyBankDeductionUploadAuth.service");

// ===============================
// Get Monthly Bank Deduction Authorization List
// ===============================
const getMonthlyBankDeductionAuthList = asyncHandler(async (req, res) => {

  const result = await service.getMonthlyBankDeductionAuthList();

  return res.status(200).json({
    success: true,
    message: "Monthly Bank Deduction Authorization List fetched successfully.",
    data: result.rows,
  });

});


// ===============================
// Get Monthly Bank Deduction Authorization Details
// ===============================
const getMonthlyBankDeductionAuthDetails = asyncHandler(async (req, res) => {

  const result = await service.getMonthlyBankDeductionAuthDetails(
    req.body.mainId
  );

  return res.status(200).json({
    success: true,
    data: result.rows,
  });

});
module.exports = {
  getMonthlyBankDeductionAuthList,
  getMonthlyBankDeductionAuthDetails
};