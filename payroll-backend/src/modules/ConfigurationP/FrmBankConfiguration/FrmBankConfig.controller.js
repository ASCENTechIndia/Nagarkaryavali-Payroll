const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmBankConfig.service");

exports.getConfiguredBank = asyncHandler(async (req, res) => {

  const data =
    await service.getConfiguredBankService(
      req.body
    );

  return ok(
    res,
    data,
    "Configured bank list fetched successfully"
  );
});

exports.getBankList = asyncHandler(async (req, res) => {

  const data =
    await service.getBankListService(
      req.body
    );

  return ok(
    res,
    data,
    "Bank list fetched successfully"
  );
});

exports.saveBankConfiguration = asyncHandler(async (req, res) => {

  const data =
    await service.saveBankConfigurationService(
      req.body
    );

  return ok(
    res,
    data,
    data.message
  );
});