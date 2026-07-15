const repo = require("./FrmRecoveryUpload.repo");
const { AppError } = require("../../../libs/errors");

// Deduction Type List
const getDeductionTypeListService = () => {
  return repo.getDeductionTypeListRepo();
};

{/*

// Recovery List
const getRecoveryListService = async (body) => {
  const { empId, ulbId } = body;

  if (!empId) {
    throw new AppError("empId is required", 400);
  }

  if (!ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  return await repo.getRecoveryListRepo({
    empId,
    ulbId,
  });
};

*/}

// Save Recovery (Accumulation)
async function saveRecoveryService(body) {
  const { 
    userId, 
    deptId, 
    subDeptId, 
    empId, 
    deductionId,
    recovAmount, 
    fromYear, 
    toYear, 
    isWorking,
    fromMonth, 
    toMonth, 
    remark,
    ulbId 
  } = body;

  if (!userId) throw new AppError("User ID is required.", 400);
  if (!deptId) throw new AppError("Please select Department.", 400);
  {/* 
  if (!subDeptId || subDeptId === "" || subDeptId === "null" || subDeptId === "undefined") {
    throw new AppError("Please select Sub Department.", 400);
  }
    */}
  if (!empId) throw new AppError("Please select Employee.", 400);
  if (!deductionId) throw new AppError("Please select Deduction Type.", 400);
  if (!recovAmount) throw new AppError("Please enter Recovery Amount.", 400);
  if (!fromYear) throw new AppError("Please select From Year.", 400);
  if (!toYear) throw new AppError("Please select To Year.", 400);
  if (!fromMonth) throw new AppError("Please select From Month.", 400);
  if (!toMonth) throw new AppError("Please select To Month.", 400);

  let isWorkingValue = 'N';
  if (isWorking === 'Y' || isWorking === true || isWorking === 'true' || isWorking === "true") {
    isWorkingValue = 'Y';
  }

  const result = await repo.saveRecoveryRepo({
    userId,
    deptId,
    subDeptId,
    empId,
    deductionId,
    recovAmount,
    isWorking: isWorkingValue,
    fromYear,
    fromMonth,
    toYear,
    toMonth,
    remark,
    ulbId,
  });

  if (!result.success) {
    throw new AppError(result.error, 400);
  }

  // Check if the error message indicates success (matches .NET behavior)
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
    message: result.errorMsg || "Recovery Details Inserted Successfully"
  };
}


const insertRecovery = async (data) => {
  return await repo.insertRecoveryRepo(data);
};


module.exports = {
  getDeductionTypeListService,
 // getRecoveryListService,
  saveRecoveryService,
  insertRecovery
};