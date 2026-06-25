const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmEmpTransferApproval.service");

exports.getEmpTransferList = asyncHandler(async (req, res) => {
    const data = await service.getEmpTransferListService(req.body);
    return ok(res, data, "Employee transfer list fetched successfully");
});

exports.getTransferTypes = asyncHandler(async (req, res) => {
    const data = await service.getTransferTypesService();
    return ok(res, data, "Transfer types fetched successfully");
});

exports.getEmpTransferDetails = asyncHandler(async (req, res) => {
    const data = await service.getEmpTransferDetailsService(req.body);
    return ok(res, data, "Employee transfer details fetched successfully");
});

exports.saveEmpTransfer = asyncHandler(async (req, res) => {
    const data = await service.saveEmpTransferService(req.body);
    if (data.success) {
        return ok(res, data, data.message);
    } else {
        return fail(res, data.message, 400);
    }
});
