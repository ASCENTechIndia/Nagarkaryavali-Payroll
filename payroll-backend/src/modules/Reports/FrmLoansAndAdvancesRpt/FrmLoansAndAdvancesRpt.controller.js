const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmLoansAndAdvancesRpt.service");
const { AppError } = require("../../../libs/errors");

exports.searchLoansAdvances = asyncHandler(async (req, res) => {
  console.log("📥 Request Body:", req.body);

  const {
    ulbid,
    categoryId,
    zoneId,
    deptId,
    employeeId
  } = req.body;

  if (!ulbid) {
    throw new AppError("ulbid is required", 400);
  }

  const payload = {
    ulbid,
    categoryId,
    zoneId,
    deptId,
    employeeId
  };

  const data = await service.searchLoansAdvancesService(payload);

  return ok(res, data, "Loans and advances fetched successfully");
});