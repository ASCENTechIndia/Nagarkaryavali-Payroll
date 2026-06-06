const asyncHandler = require("../../../libs/asyncHandler");
const { ok, notFound, badRequest } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const service = require("./FrmPayrollDashbordMst.service");

exports.getDepartmentList = asyncHandler(async (req, res) => {
    const { ulbid } = req.body;

    const data = await service.getDepartmentService({ ulbid });
    return ok(res, data, data.message);
});

exports.getDesignationList = asyncHandler(async (req, res) => {
    const { ulbid, deptid } = req.body;

    const data = await service.getDesignationService({ ulbid, deptid });
    return ok(res, data, data.message);
});

exports.getEmployeeDetails = asyncHandler(async (req, res) => {
    const { ulbid, deptid, designationid, corpId } = req.body;
    
    const data = await service.getEmployeeDetailsService({ 
        ulbid, 
        deptid, 
        designationid, 
        corpId 
    });
    return ok(res, data, data.message);
});
