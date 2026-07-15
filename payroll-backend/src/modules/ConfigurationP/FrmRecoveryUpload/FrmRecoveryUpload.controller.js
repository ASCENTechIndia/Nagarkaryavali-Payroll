const service = require("./FrmRecoveryUpload.service");
const asyncHandler = require("../../../libs/asyncHandler");

exports.getDeductionTypeList = asyncHandler(async (req, res) => {
  res.json(await service.getDeductionTypeListService());
});

{/*
exports.getRecoveryList = asyncHandler(async (req, res) => {
  res.json(await service.getRecoveryListService(req.body));
});
*/}

exports.saveRecovery = asyncHandler(async (req, res) => {
  res.json(await service.saveRecoveryService(req.body));
});

exports.insertRecovery = asyncHandler(async (req, res) => {
  const result = await service.insertRecovery(req.body);

  return res.status(200).json({
    success: result.success,
    errorCode: result.errorCode,
    errorMsg: result.errorMsg,
  });
});
