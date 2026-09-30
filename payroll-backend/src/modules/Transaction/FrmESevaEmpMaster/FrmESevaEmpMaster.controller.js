const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmESevaEmpMaster.service");

exports.getNationalityDropdown = asyncHandler(async (req, res) => {
    const data = await service.getNationalityDropdownService();
    return ok(res, data, "Nationality dropdown fetched successfully");
});

exports.getReligionDropdown = asyncHandler(async (req, res) => {
    const data = await service.getReligionDropdownService();
    return ok(res, data, "Religion dropdown fetched successfully");
});

exports.getCategoryDropdown = asyncHandler(async (req, res) => {
    const { ulbid } = req.body;
    const data = await service.getCategoryDropdownService({ ulbid });
    return ok(res, data, "Category dropdown fetched successfully");
});

exports.getBloodGroupDropdown = asyncHandler(async (req, res) => {
    const data = await service.getBloodGroupDropdownService();
    return ok(res, data, "Blood group dropdown fetched successfully");
});

exports.getRelationDropdown = asyncHandler(async (req, res) => {
    const data = await service.getRelationDropdownService();
    return ok(res, data, "Relation dropdown fetched successfully");
});

exports.getCasteDropdown = asyncHandler(async (req, res) => {
    const { ulbid, religionId } = req.body;
    const data = await service.getCasteDropdownService({ ulbid, religionId });
    return ok(res, data, "Caste dropdown fetched successfully");
});

exports.getSubCasteDropdown = asyncHandler(async (req, res) => {
    const { ulbid, casteId, religionId } = req.body;
    const data = await service.getSubCasteDropdownService({ ulbid, casteId, religionId });
    return ok(res, data, "Sub-caste dropdown fetched successfully");
});


exports.getEmployeeDef = asyncHandler(async (req, res) => {
    const { ulbid, empId } = req.body;
    const data = await service.getEmployeeDefService({ ulbid, empId });
    return ok(res, data, "Employee details fetched successfully");
});

exports.getEsevaEmpDetails = asyncHandler(async (req, res) => {
    const { ulbid, empId, esevaEmpId, mode } = req.body;
    const data = await service.getEsevaEmpDetailsService({ ulbid, empId, esevaEmpId, mode });
    return ok(res, data, "E-Seva employee details fetched successfully");
});

exports.insertEsevaEmp = asyncHandler(async (req, res) => {
    const payload = req.body;
    const data = await service.insertEsevaEmpService(payload);

    if (data.success) {
        return ok(res, data, data.message);
    } else {
        return fail(res, data.message, 400);
    }
});