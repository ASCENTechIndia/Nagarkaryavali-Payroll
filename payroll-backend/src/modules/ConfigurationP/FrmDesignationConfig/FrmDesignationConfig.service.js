const repo = require("./FrmDesignationConfig.repo");
const { AppError } = require("../../../libs/errors");

// Get Corporation List
const getCorporationListService = () => {
  return repo.getCorporationListRepo();
};

// Get Designation Data
const getDesignationDataService = async (body) => {
  const { ulbId } = body;

  if (!ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const result = await repo.getDesignationDataRepo({ ulbId });
  
  return result;
};

// Get Designation Configuration
const getDesignationConfigService = async (body) => {
  const { ulbId } = body;

  if (!ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const result = await repo.getDesignationConfigRepo({ ulbId });
  
  return result;
};

// Save Designation Configuration
async function saveDesignationConfigService(body) {
  const { 
    userId, 
    ulbId, 
    desigStr, 
    mode,
    ipaddress,
    source
  } = body;

  // Required field validations
  if (!userId) throw new AppError("User ID is required.", 400);
  if (!ulbId) throw new AppError("ULB ID is required.", 400);
  if (!desigStr) throw new AppError("Designation data is required.", 400);
  
  // Validate designation string format
  const records = desigStr.split('$');
  let hasValidRecord = false;
  for (const record of records) {
    if (record.trim() === '') continue;
    const parts = record.split('#');
    if (parts.length === 3) {
      hasValidRecord = true;
      break;
    }
  }
  
  if (!hasValidRecord) {
    throw new AppError("Invalid designation data format.", 400);
  }

  const result = await repo.saveDesignationConfigRepo({
    userId,
    ulbId,
    desigStr,
    mode: mode || 1,
    ipaddress: ipaddress || '127.0.0.1',
    source: source || 'WEB',
  });

  if (!result.success) {
    throw new AppError(result.errorMsg || result.error || "An error occurred", 400);
  }

  return {
    success: true,
    errorCode: result.errorCode || 9999,
    errorMsg: result.errorMsg || "Designation configuration saved successfully",
    message: result.errorMsg || "Designation configuration saved successfully"
  };
}

module.exports = {
  getCorporationListService,
  getDesignationDataService,
  getDesignationConfigService,
  saveDesignationConfigService,
};