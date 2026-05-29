const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmBranchConfig.service");

exports.getCorporationList = asyncHandler(async (req, res) => {

  const data =
    await service.getCorporationListService();

  return ok(
    res,
    data,
    "Corporation list fetched successfully"
  );
});

exports.getBranchList = asyncHandler(async (req, res) => {

  const data =
    await service.getBranchListService(req.body);

  return ok(
    res,
    data,
    "Branch list fetched successfully"
  );
});

exports.getConfiguredBranch = asyncHandler(async (req, res) => {

  const data =
    await service.getConfiguredBranchService(req.body);

  return ok(
    res,
    data,
    "Configured branch list fetched successfully"
  );
});

exports.saveBranchConfiguration = asyncHandler(async (req, res) => {

  const data =
    await service.saveBranchConfigurationService(req.body);

  return ok(
    res,
    data,
    data.message
  );
});