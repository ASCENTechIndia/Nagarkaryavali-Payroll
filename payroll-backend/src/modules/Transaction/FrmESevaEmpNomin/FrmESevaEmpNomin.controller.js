const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmESevaEmpNomin.service");

exports.getAccountHeadDropdown = asyncHandler(async (req, res) => {
    const data = await service.getAccountHeadDropdownService();
    return ok(res, data, "Account head dropdown fetched successfully");
});

exports.getNominationData = asyncHandler(async (req, res) => {
    const { ulbid, empId, esevaEmpId } = req.body;
    const data = await service.getNominationDataService({ ulbid, empId, esevaEmpId });
    return ok(res, data, "Nomination data fetched successfully");
});

exports.insertNomination = asyncHandler(async (req, res) => {
    const payload = req.body;
    const data = await service.insertNominationService(payload);

    if (data.success) {
        return ok(res, data, data.message);
    } else {
        return fail(res, data.message, 400);
    }
});