const service = require("./FrmLoansAndAdvancesRpt.service");
const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");

exports.getLoanAndAdvancesRpt = asyncHandler(async (req, res) => {
const data = await service.getLoanAndAdvancesRpt();
return ok(
  res,
  data,
  "Loan And Advances Report"
);
});

exports.geEmployeeCodes = asyncHandler(async (req, res) => {
const data = await service.getLoanAndAdvancesRpt();
return ok(
  res,
  data,
  "Loan And Advances Report"
);
});