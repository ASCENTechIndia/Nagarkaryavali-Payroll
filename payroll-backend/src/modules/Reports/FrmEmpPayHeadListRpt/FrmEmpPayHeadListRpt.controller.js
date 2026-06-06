const asyncHandler = require("../../../libs/asyncHandler");
const { ok, notFound } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const service = require("./FrmEmpPayHeadListRpt.service");

exports.getEmployeeList = asyncHandler(async (req, res) => {
    const { ulbid } = req.body;

    const data = await service.getEmployeeListService({ ulbid });
    return ok(res, data, "Employee list fetched successfully");
});


exports.getZoneList = asyncHandler(async (req, res) => {
    const { ulbid } = req.body;

    const data = await service.getZoneListService({ ulbid });
    return ok(res, data, "Zone list fetched successfully");
});

exports.getEmployeePayHeadList = asyncHandler(async (req, res) => {
    const {
        ulbid,
        categoryId,
        zoneId,
        deptId,
        employeeId,
        payHeadId
    } = req.body;

    const data = await service.getEmployeePayHeadListService({
        ulbid,
        categoryId,
        zoneId,
        deptId,
        employeeId,
        payHeadId
    });
    
    return ok(res, data, "Employee PayHead List report generated successfully");
    
});
