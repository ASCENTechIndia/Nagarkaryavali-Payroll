const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmLeaveConfig.service");

exports.getConfiguredLeave = asyncHandler(async (req, res) => {

  const data =
    await service.getConfiguredLeaveService(
      req.body
    );

  return ok(
    res,
    data,
    "Configured leave list fetched successfully"
  );
});

exports.getLeaveList = asyncHandler(async (req, res) => {

  const data =
    await service.getLeaveListService(
      req.body
    );

  return ok(
    res,
    data,
    "Leave list fetched successfully"
  );
});

exports.saveLeaveConfiguration = asyncHandler(async (req, res) => {

  const data =
    await service.saveLeaveConfigurationService(
      req.body
    );

  return ok(
    res,
    data,
    data.message
  );
});