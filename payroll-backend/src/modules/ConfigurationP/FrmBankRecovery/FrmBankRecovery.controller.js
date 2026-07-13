const service = require("./FrmBankRecovery.service");
const asyncHandler = require("../../../libs/asyncHandler");

exports.getMonthList = asyncHandler(async (req, res) => {
  res.json(await service.getMonthListService());
});

exports.getYearList = asyncHandler(async (req, res) => {
  res.json(await service.getYearListService());
});

exports.getBankRecoveryList = asyncHandler(async (req, res) => {
  res.json(await service.getBankRecoveryListService(req.body));
});

exports.saveBankRecovery = asyncHandler(async (req, res) => {
  res.json(await service.saveBankRecoveryService(req.body));
});
