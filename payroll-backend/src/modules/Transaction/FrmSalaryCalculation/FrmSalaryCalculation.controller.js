const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const service = require("./FrmSalaryCalculation.service");

exports.getEmployeeList = asyncHandler(async (req, res) => {
  const data = await service.getEmployeeListService();
  return ok(res, data, data.message);
});

exports.getBillList = asyncHandler(async (req, res) => {
  const { ulbid, deptid } = req.body;
  if (!ulbid) {
    throw new AppError("ulbid is required", 400);
  }

  const payload = { ulbid, deptid };

  const data = await service.getBillListService(payload);
  return ok(res, data, data.message);
});

exports.calculateSalary = asyncHandler(async (req, res) => {
    console.log("📥 Request Body:", req.body);
    const {userId, date, categoryId, zone, dept, ulbid, subdepartment, billno} = req.body;
    if (!userId) {
        throw new AppError("userId is required", 400);
    }
    if (!date) {
        throw new AppError("date is required", 400);
    }
    if (!dept) {
        throw new AppError("dept is required", 400);
    }
    if (!ulbid) {
        throw new AppError("ulbid is required", 400);
    }
    const payload = { userId, date, categoryId, zone, dept, ulbid, subdepartment, billno };
    const data = await service.calculateSalaryService(payload);
    return ok( res, data, data.errorMsg || "Salary calculated successfully");
});

exports.deleteSalary = asyncHandler(async (req, res) => {
    const { userId, date, categoryId, zone, dept, ulbid, subdepartment, billno } = req.body;
    const data = await service.deleteSalaryService({ userId, date, categoryId, zone, dept, ulbid, subdepartment, billno });
    return ok( res, data, data.errorMsg || "Salary deleted successfully");
});