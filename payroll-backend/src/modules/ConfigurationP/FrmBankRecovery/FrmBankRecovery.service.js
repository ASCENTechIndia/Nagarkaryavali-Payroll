const repo = require("./FrmBankRecovery.repo");
const { AppError } = require("../../../libs/errors");

// ✅ Month List
const getMonthListService = () => {
  return repo.getMonthListRepo();
};

// ✅ Year List
const getYearListService = () => {
  return repo.getYearListRepo();
};

// ✅ Bank Recovery List
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

async function saveBankRecoveryService(body) {
  const {
    deptId,
    subDeptId,
    empId,
    bankId,
    branchId,
    recovAmount,
    fromYear,
    toYear,
    fromMonth,
    toMonth,
  } = body;

  if (!deptId) throw new AppError("Please select Department.", 400);
  if (!subDeptId) throw new AppError("Please select Sub Department.", 400);
  if (!empId) throw new AppError("Please select Employee.", 400);
  if (!bankId) throw new AppError("Please select Bank.", 400);
  if (!branchId) throw new AppError("Please select Branch.", 400);
  if (!recovAmount) throw new AppError("Please enter Recovery Amount.", 400);
  if (!fromYear) throw new AppError("Please select From Year.", 400);
  if (!toYear) throw new AppError("Please select To Year.", 400);
  if (!fromMonth) throw new AppError("Please select From Month.", 400);
  if (!toMonth) throw new AppError("Please select To Month.", 400);

  const result = await repo.saveBankRecoveryRepo(body);

  if (!result.success) {
    throw new AppError(result.error, 400);
  }

  const errorCode = Number(result.errorCode);

  if (errorCode === 9999) {
    return result;
  }

  throw new AppError(
    result.errorMsg || "Failed to save Bank Recovery.",
    400
  );
}

module.exports = {
  getMonthListService,
  getYearListService,
  getBankRecoveryListService,
  saveBankRecoveryService,
};
