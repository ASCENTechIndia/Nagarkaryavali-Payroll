const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmRelationConfig.service");

exports.getRelationList = asyncHandler(async (req, res) => {

  const data =
    await service.getRelationListService(req.body);

  return ok(
    res,
    data,
    "Relation list fetched successfully"
  );
});

exports.getConfiguredRelation = asyncHandler(async (req, res) => {

  const data =
    await service.getConfiguredRelationService(req.body);

  return ok(
    res,
    data,
    "Configured relation list fetched successfully"
  );
});

exports.saveRelationConfiguration = asyncHandler(async (req, res) => {

  const data =
    await service.saveRelationConfigurationService(req.body);

  return ok(
    res,
    data,
    data.message
  );
});