const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmSalDeduction.service");

// ===============================
// Get Deduction Head List
// ===============================
const getDeductionHeadList = asyncHandler(async (req, res) => {
  const { ulbId } = req.body;

  const result = await service.getDeductionHeadList(ulbId);

  return res.status(200).json({
    success: true,
    message: "Deduction Head List fetched successfully.",
    data: result.rows,
  });
});

// ===============================
// Get Employee List
// ===============================
const getEmployeeList = asyncHandler(async (req, res) => {
  const result = await service.getEmployeeList(req.body);

  return res.status(200).json({
    success: true,
    message: "Employee List fetched successfully.",
    data: result.rows,
  });
});

// ===============================
// Insert Salary Deduction
// ===============================
const insertSalDeduction = asyncHandler(async (req, res) => {

  const result = await service.insertSalDeduction(req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);

});

module.exports = {
  getDeductionHeadList,
  getEmployeeList,
  insertSalDeduction
};
