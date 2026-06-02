const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmPayCommissionConfig.service");

exports.getPayCommissionList = asyncHandler(async (req, res) => {

  const data =
    await service.getPayCommissionListService(req.body);

  return ok(
    res,
    data,
    "Pay commission list fetched successfully"
  );
});

exports.getConfiguredPayCommission = asyncHandler(async (req, res) => {

  const data =
    await service.getConfiguredPayCommissionService(req.body);

  return ok(
    res,
    data,
    "Configured pay commission list fetched successfully"
  );
});

exports.savePayCommissionConfiguration = asyncHandler(async (req, res) => {

  const data =
    await service.savePayCommissionConfigurationService(req.body);

  return ok(
    res,
    data,
    data.message
  );
});