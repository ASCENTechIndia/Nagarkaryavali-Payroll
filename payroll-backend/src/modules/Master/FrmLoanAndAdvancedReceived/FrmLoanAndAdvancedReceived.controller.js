const service = require("./FrmLoanAndAdvancedReceived.service");
const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");

exports.getLoanAndAdvancedReceived = asyncHandler(async (req, res) => {
const data = await service.getLoanAndAdvancedReceivedService();
return ok(
  res,
  data,
  "Loan And Advanced Received List"
);
});