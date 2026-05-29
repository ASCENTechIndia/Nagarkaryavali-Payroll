const repo = require("./FrmDeptListMst.repo");
const { AppError } = require("../../../libs/errors");

const getDepartmentListService = async () => {
  return await repo.getDepartmentList();
};

const searchDepartmentListService = async (body) => {
  return await repo.searchDepartmentList(body);
};

const getDepartmentDetailsByIdService = async (body) => {
  const { deptId } = body;

  if (!deptId) {
    throw new AppError("deptId is required", 400);
  }

  return await repo.getDepartmentDetailsById(body);
};

const saveDepartmentService = async (body) => {
  const { userId, deptId, deptnameE, deptnameM, mode } = body;

  if (!userId) throw new AppError("userId is required", 400);
  if (!deptnameE) throw new AppError("Department Name (English) is required", 400);
  if (!deptnameM) throw new AppError("Department Name (Marathi) is required", 400);
  if (!mode) throw new AppError("mode is required", 400);

  const result = await repo.saveDepartment(body);

  if (result.out_ErrorCode < 0 && result.out_ErrorCode !== -100) {
    throw new AppError(result.out_ErrorMsg, 400);
  }

  return {
    success: true,
    errorCode: result.out_ErrorCode,
    message: result.out_ErrorMsg,
  };
};

module.exports = {
  getDepartmentListService,
  searchDepartmentListService,
  getDepartmentDetailsByIdService,
  saveDepartmentService,
};
