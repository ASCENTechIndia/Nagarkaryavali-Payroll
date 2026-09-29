const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmESevaEmpEducationalInformation.service");

exports.getEducationalInfo = asyncHandler(async (req, res) => {
    const { ulbid, empId, esevaEmpId } = req.body;
    const data = await service.getEducationalInfoService({ ulbid, empId, esevaEmpId });
    return ok(res, data, "Educational information fetched successfully");
});

exports.getAdditionalTraining = asyncHandler(async (req, res) => {
    const { ulbid, empId, esevaEmpId } = req.body;
    const data = await service.getAdditionalTrainingService({ ulbid, empId, esevaEmpId });
    return ok(res, data, "Additional training fetched successfully");
});

exports.getProfessionalTraining = asyncHandler(async (req, res) => {
    const { ulbid, empId, esevaEmpId } = req.body;
    const data = await service.getProfessionalTrainingService({ ulbid, empId, esevaEmpId });
    return ok(res, data, "Professional training fetched successfully");
});

exports.insertEducationalInfo = asyncHandler(async (req, res) => {
    const payload = req.body;
    const data = await service.insertEducationalInfoService(payload);

    if (data.success) {
        return ok(res, data, data.message);
    } else {
        return fail(res, data.message, 400);
    }
});