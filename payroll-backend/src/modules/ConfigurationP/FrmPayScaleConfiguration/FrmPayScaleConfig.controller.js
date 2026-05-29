const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmPayScaleConfig.service");


exports.getPayScaleList = asyncHandler(async (req, res) => {

  const data =
    await service.getPayScaleListService(
      req.body
    );

  return ok(
    res,
    data,
    "Pay scale list fetched successfully"
  );
});


exports.getConfiguredPayScale = asyncHandler(async (req, res) => {

  const data =
    await service.getConfiguredPayScaleService(
      req.body
    );

  return ok(
    res,
    data,
    "Configured pay scale list fetched successfully"
  );
});


exports.savePayScaleConfiguration =asyncHandler(async (req, res) => {

      const data =
        await service.savePayScaleConfigurationService(
          req.body
        );

      return ok(
        res,
        data,
        data.message
      );
    }
  );