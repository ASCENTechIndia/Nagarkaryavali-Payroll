const repo = require("./FrmBankRecovery.repo");
const { AppError } = require("../../../libs/errors");

// Month List
const getMonthListService = () => {
  return repo.getMonthListRepo();
};

// Year List
const getYearListService = () => {
  return repo.getYearListRepo();
};

// Bank Recovery List
const getBankRecoveryListService = async (body) => {
  const { empId, ulbId } = body;

  if (!empId) {
    throw new AppError("empId is required", 400);
  }

  if (!ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  return await repo.getBankRecoveryListRepo({
    empId,
    ulbId,
  });
};

// Save Recovery List
async function saveBankRecoveryService(body) {
  const { 
    userId, 
    deptId, 
    subDeptId, 
    empId, 
    bankId, 
    branchId, 
    recovAmount, 
    fromYear, 
    toYear, 
    isWorking,
    fromMonth, 
    toMonth, 
    ulbId 
  } = body;

  // Required field validations
  if (!userId) throw new AppError("User ID is required.", 400);
  if (!deptId) throw new AppError("Please select Department.", 400);
  // Sub-Department validation removed - it's now optional
  if (!empId) throw new AppError("Please select Employee.", 400);
  if (!bankId) throw new AppError("Please select Bank.", 400);
  //if (!branchId) throw new AppError("Please select Branch.", 400);
  if (!recovAmount) throw new AppError("Please enter Recovery Amount.", 400);
  if (!fromYear) throw new AppError("Please select From Year.", 400);
  if (!toYear) throw new AppError("Please select To Year.", 400);
  if (!fromMonth) throw new AppError("Please select From Month.", 400);
  if (!toMonth) throw new AppError("Please select To Month.", 400);
  
  // Sub-Department is optional - if empty/undefined, set to null
  let finalSubDeptId = subDeptId;
  if (!finalSubDeptId || finalSubDeptId === "" || finalSubDeptId === "null" || finalSubDeptId === "undefined") {
    finalSubDeptId = null;
  }

  // Branch is optional - if empty/undefined, set to null
  let finalBranchId = branchId;
  if (!finalBranchId || finalBranchId === "" || finalBranchId === "null" || finalBranchId === "undefined") {
    finalBranchId = null;
  }

  const result = await repo.saveBankRecoveryRepo({
    userId,
    deptId,
    subDeptId: finalSubDeptId,
    empId,
    bankId,
    branchId: finalBranchId,
    recovAmount,
    isWorking,
    fromYear,
    fromMonth,
    toYear,
    toMonth,
    ulbId,
  });

  if (!result.success) {
    throw new AppError(result.error, 400);
  }

  // to check if the error message indicates success
  const errorMsg = result.errorMsg || "";
  const isSuccess = errorMsg.includes("Inserted Successfully") || 
                    errorMsg.includes("Successfully") ||
                    errorMsg.includes("success") ||
                    errorMsg.includes("saved") ||
                    result.errorCode === -100 ||
                    result.errorCode === 9999 ||
                    result.errorCode === 0;

  if (!isSuccess) {
    throw new AppError(result.errorMsg || "An error occurred", 400);
  }

  return {
    success: true,
    errorCode: result.errorCode,
    errorMsg: result.errorMsg,
    message: result.errorMsg || "Bank Recovery Details Inserted Successfully"
  };
}

module.exports = {
  getMonthListService,
  getYearListService,
  getBankRecoveryListService,
  saveBankRecoveryService,
};
