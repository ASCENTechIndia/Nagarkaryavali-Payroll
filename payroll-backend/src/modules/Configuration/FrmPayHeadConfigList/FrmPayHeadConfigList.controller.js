const service = require("./FrmPayHeadConfigList.service");
const asyncHandler = require("../../../libs/asyncHandler");

exports.getPayHeadList = asyncHandler(async (req, res) => {
  res.json(await service.getPayHeadListService(req.body));
});

exports.getPayHeadConfigList = asyncHandler(async (req, res) => {
  res.json(await service.getPayHeadConfigListService(req.body));
});

exports.getPayHeadDropdown = asyncHandler(async (req, res) => {
  res.json(await service.getPayHeadDropdownService(req.body));
});

exports.getPayHeadConfigDetails = asyncHandler(async (req, res) => {
  res.json(
    await service.getPayHeadConfigDetailsService(req.body)
  );
});


exports.savePayHeadConfig = asyncHandler(async (req, res) => {
  res.json(
    await service.savePayHeadConfigService(req.body)
  );
});