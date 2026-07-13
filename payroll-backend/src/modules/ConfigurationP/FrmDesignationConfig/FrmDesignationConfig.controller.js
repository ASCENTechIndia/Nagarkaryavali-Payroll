const service = require("./FrmDesignationConfig.service");
const asyncHandler = require("../../../libs/asyncHandler");

exports.getCorporationList = asyncHandler(async (req, res) => {
  const result = await service.getCorporationListService();
  res.json({
    success: true,
    data: result
  });
});

exports.getDesignationData = asyncHandler(async (req, res) => {
  const result = await service.getDesignationDataService(req.body);
  res.json({
    success: true,
    data: result
  });
});

exports.getDesignationConfig = asyncHandler(async (req, res) => {
  const result = await service.getDesignationConfigService(req.body);
  res.json({
    success: true,
    data: result
  });
});

exports.saveDesignationConfig = asyncHandler(async (req, res) => {
  const result = await service.saveDesignationConfigService({
    ...req.body,
    ipaddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    source: 'WEB'
  });
  res.json({
    success: true,
    data: result
  });
});