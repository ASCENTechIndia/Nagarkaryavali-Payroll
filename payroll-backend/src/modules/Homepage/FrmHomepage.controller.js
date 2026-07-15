const asyncHandler = require("../../libs/asyncHandler");
const { ok, fail } = require("../../libs/response");
const service = require("./FrmHomepage.service");

// ===============================
const getDepartmentWiseEmployee = asyncHandler(async (req, res) => {
  const { ulbId } = req.body;

  const result = await service.getDepartmentWiseEmployee(ulbId);

  return res.status(200).json({
    success: true,
    message: "Department Wise Employee fetched successfully.",
    data: result.rows,
  });
});

// ===============================
const getGradeWiseEmployee = asyncHandler(async (req, res) => {
  const { ulbId } = req.body;

  const result = await service.getGradeWiseEmployee(ulbId);

  return res.status(200).json({
    success: true,
    message: "Grade Wise Employee fetched successfully.",
    data: result.rows,
  });
});

// ===============================
const getDepartmentWiseSalary = asyncHandler(async (req, res) => {
  const { ulbId } = req.body;

  const result = await service.getDepartmentWiseSalary(ulbId);

  return res.status(200).json({
    success: true,
    message: "Department Wise Salary fetched successfully.",
    data: result.rows,
  });
});

module.exports = {
  getDepartmentWiseEmployee,
  getGradeWiseEmployee,
  getDepartmentWiseSalary,
};
