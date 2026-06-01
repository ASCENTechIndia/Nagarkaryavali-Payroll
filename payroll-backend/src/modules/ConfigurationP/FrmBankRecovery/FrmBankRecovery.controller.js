const service = require("./FrmBankRecovery.service");
const asyncHandler = require("../../../libs/asyncHandler");

// ✅ Month List
exports.getMonthList = asyncHandler(async (req, res) => {
  res.json(await service.getMonthListService());
});

// ✅ Year List
exports.getYearList = asyncHandler(async (req, res) => {
  res.json(await service.getYearListService());
});

// ✅ Bank Recovery List
exports.getBankRecoveryList = asyncHandler(async (req, res) => {
  res.json(await service.getBankRecoveryListService(req.body));
});

exports.saveBankRecovery = asyncHandler(async (req, res) => {
  res.json(await service.saveBankRecoveryService(req.body));
});
