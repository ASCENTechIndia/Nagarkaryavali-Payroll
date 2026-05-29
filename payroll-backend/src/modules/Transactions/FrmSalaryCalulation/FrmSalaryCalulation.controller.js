const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const service = require("./FrmSalaryCalulation.service");

exports.getCategory = asyncHandler(async (req, res) => {
    const { ulbid } = req.body;
    
    if (!ulbid) {
        throw new AppError("ulbid is required", 400);
    }
    
    const data = await service.getCategoryService({ ulbid });
    return ok(res, data, "Category list fetched successfully");
});

exports.getDepartment = asyncHandler(async (req, res) => {
    const { ulbid } = req.body;
    
    if (!ulbid) {
        throw new AppError("ulbid is required", 400);
    }
    
    const data = await service.getDepartmentService({ ulbid });
    return ok(res, data, "Department list fetched successfully");
});

exports.getEmployeeSalaryList = asyncHandler(async (req, res) => {
    const {
        categoryId,
        deptId,
        subdeptId,
        billNo,
        searchEmpId,
        searchEmpName,
        salaryDate,
        ulbid,
        month,
        year
    } = req.body;
    
    if (!categoryId) throw new AppError("categoryId is required", 400);
    if (!salaryDate) throw new AppError("salaryDate is required", 400);
    if (!ulbid) throw new AppError("ulbid is required", 400);
    
    const data = await service.getEmployeeSalaryListService({
        categoryId,
        deptId,
        subdeptId,
        billNo,
        searchEmpId,
        searchEmpName,
        salaryDate,
        ulbid,
        month,
        year
    });
    
    return ok(res, data, "Employee salary list fetched successfully");
});

exports.getSubDepartment = asyncHandler(async (req, res) => {
    const { deptId, ulbid } = req.body;
    
    if (!deptId) throw new AppError("deptId is required", 400);
    if (!ulbid) throw new AppError("ulbid is required", 400);
    
    const data = await service.getSubDepartmentService({ deptId, ulbid });
    return ok(res, data, "SubDepartment list fetched successfully");
});

exports.getEmployeeSalaryDetail = asyncHandler(async (req, res) => {
    const { empId, salaryDate, ulbid } = req.body;
    
    if (!empId) throw new AppError("empId is required", 400);
    if (!salaryDate) throw new AppError("salaryDate is required", 400);
    if (!ulbid) throw new AppError("ulbid is required", 400);
    
    const data = await service.getEmployeeSalaryDetailService({ empId, salaryDate, ulbid });
    return ok(res, data, "Employee salary details fetched successfully");
});

exports.getSalaryEarning = asyncHandler(async (req, res) => {
    const { empId, salaryDate, ulbid } = req.body;
    
    if (!empId) throw new AppError("empId is required", 400);
    if (!salaryDate) throw new AppError("salaryDate is required", 400);
    if (!ulbid) throw new AppError("ulbid is required", 400);
    
    const data = await service.getSalaryEarningService({ empId, salaryDate, ulbid });
    return ok(res, data, "Salary earnings fetched successfully");
});

exports.getSalaryDeduction = asyncHandler(async (req, res) => {
    const { empId, salaryDate, ulbid } = req.body;
    
    if (!empId) throw new AppError("empId is required", 400);
    if (!salaryDate) throw new AppError("salaryDate is required", 400);
    if (!ulbid) throw new AppError("ulbid is required", 400);
    
    const data = await service.getSalaryDeductionService({ empId, salaryDate, ulbid });
    return ok(res, data, "Salary deductions fetched successfully");
});

exports.getBillNo = asyncHandler(async (req, res) => {
    const { ulbid, deptId, subdeptId } = req.body;
    
    if (!ulbid) throw new AppError("ulbid is required", 400);
    
    const data = await service.getBillNoService({ ulbid, deptId, subdeptId });
    return ok(res, data, "Bill numbers fetched successfully");
});

exports.saveSalaryEdit = asyncHandler(async (req, res) => {
    const {
        userId,
        date,
        empid,
        paramStr,
        earnings,
        deduction,
        presentDays,
        withoutPay,
        medicalLeave,
        earnedLeave,
        halfDay,
        ulbId
    } = req.body;
    
    if (!userId) throw new AppError("userId is required", 400);
    if (!date) throw new AppError("date is required", 400);
    if (!empid) throw new AppError("empid is required", 400);
    if (!paramStr) throw new AppError("paramStr is required", 400);
    if (!ulbId) throw new AppError("ulbId is required", 400);
    
    const data = await service.saveSalaryEditService({
        userId,
        date,
        empid,
        paramStr,
        earnings,
        deduction,
        presentDays,
        withoutPay,
        medicalLeave,
        earnedLeave,
        halfDay,
        ulbId
    });
    
    return ok(res, data, data.message || "Salary saved successfully");
});