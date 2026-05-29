const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const service = require("./FrmMonthClose.service");

exports.monthClose = asyncHandler(async (req, res) => {
  console.log("📥 Request Body:", req.body);
  const { userId, date, ulbid } = req.body;
  if (!userId) {
    throw new AppError("userId is required", 400);
  }
  if (!date) {
    throw new AppError("date is required", 400);
  }
  if (!ulbid) {
    throw new AppError("ulbid is required", 400);
  }

  const data = await service.monthCloseService({ userId, date, ulbid });
  return ok( res, data, data.message );
});