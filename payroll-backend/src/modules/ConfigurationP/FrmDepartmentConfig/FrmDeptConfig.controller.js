const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmDeptConfig.service");

exports.getDepartmentList = asyncHandler(async (req, res) => {

  const data =
    await service.getDepartmentListService(
      req.params.ulbId
    );

  return ok(
    res,
    data,
    "Department list fetched successfully"
  );
});

exports.getConfiguredDepartments = asyncHandler(async (req, res) => {

  const data =
    await service.getConfiguredDepartmentsService(
      req.params.ulbId
    );

  return ok(
    res,
    data,
    "Configured departments fetched successfully"
  );
});

exports.saveDepartmentConfiguration =
  asyncHandler(async (req, res) => {

    const data =
      await service.saveDepartmentConfigurationService(
        req.body
      );

    return ok(
      res,
      data,
      data.errorMsg
    );
  });