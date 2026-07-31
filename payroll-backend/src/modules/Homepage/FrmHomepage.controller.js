const asyncHandler = require("../../libs/asyncHandler");
const { ok, fail } = require("../../libs/response");
const service = require("./FrmHomepage.service");

const getDepartmentWiseEmployee = asyncHandler(async (req, res) => {
  const { ulbId } = req.body;

  const result = await service.getDepartmentWiseEmployee(ulbId);

  return res.status(200).json({
    success: true,
    message: "Department Wise Employee fetched successfully.",
    data: result.rows,
  });
});

const getGradeWiseEmployee = asyncHandler(async (req, res) => {
  const { ulbId } = req.body;

  const result = await service.getGradeWiseEmployee(ulbId);

  return res.status(200).json({
    success: true,
    message: "Grade Wise Employee fetched successfully.",
    data: result.rows,
  });
});

const getDepartmentWiseSalary = asyncHandler(async (req, res) => {
  const { ulbId } = req.body;

  const result = await service.getDepartmentWiseSalary(ulbId);

  return res.status(200).json({
    success: true,
    message: "Department Wise Salary fetched successfully.",
    data: result.rows,
  });
});

const getDesignationController = asyncHandler(
    async (req, res) => {
        console.log("Request Body", req.query);
        const { deptId, ulbId } = req.query;

        if (!ulbId) {
          return  fail(res, error = "ulbid is required");
        }
        if (!deptId) {
          return  fail(res, error = "deptId is required");
        }

        const data = await service.getDesignationService({ deptId, ulbId });
        return ok(res, data, data.message || "Designation List fetched sucessfully")
    }
)

const getDepartmentController = asyncHandler(async (req, res) => {
    const { ulbId } = req.query;

    if (!ulbId) {
        return fail(res, "ulbId is required");
    }

    const data = await service.getDepartmentService({ ulbId });

    return ok(res, data, data.message || "Department List fetched successfully");
});

const getEmployeeController = asyncHandler(async (req, res) => {
    const { ulbId, deptId, designationId } = req.query;

    if (!ulbId) {
        return fail(res, "ulbId is required");
    }
    if (!deptId) {
        return fail(res, "deptId is required");
    }
    if (!designationId) {
        return fail(res, "designationId is required");
    }

    const data = await service.getEmployeeService({ ulbId, deptId, designationId });

    return ok(res, data, data.message || "Employee List fetched successfully");
});

module.exports = {
  getDepartmentWiseEmployee,
  getGradeWiseEmployee,
  getDepartmentWiseSalary,
  getDesignationController,
  getDepartmentController,
  getEmployeeController
};
