const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmReligionConfig.service");

exports.getReligionList = asyncHandler(async (req, res) => {

  const data =
    await service.getReligionListService(req.body);

  return ok(
    res,
    data,
    "Religion list fetched successfully"
  );
});

exports.getConfiguredReligion = asyncHandler(async (req, res) => {

  const data =
    await service.getConfiguredReligionService(req.body);

  return ok(
    res,
    data,
    "Configured religion list fetched successfully"
  );
});

exports.saveReligionConfiguration = asyncHandler(async (req, res) => {

  const data =
    await service.saveReligionConfigurationService(req.body);

  return ok(
    res,
    data,
    data.message
  );
});