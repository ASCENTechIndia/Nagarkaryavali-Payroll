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

  console.log('Service received payload:', body);

  if (!userId) throw new AppError("userId is required", 400);
  if (!deptnameE) throw new AppError("Department Name (English) is required", 400);
  if (!deptnameM) throw new AppError("Department Name (Marathi) is required", 400);
  if (!mode) throw new AppError("mode is required", 400);

  try {
    const result = await repo.saveDepartment(body);
    console.log('Repository result:', result);
    const errorCode = result.out_ErrorCode;
    const errorMsg = result.out_ErrorMsg;

    if (errorCode === 0 || errorCode === -100) {
      return {
        ok: true,
        success: true,
        errorCode: errorCode,
        message: errorMsg || 'Department saved successfully',
        data: { message: errorMsg || 'Department saved successfully' }
      };
    } else if (errorCode < 0) {
      
      return {
        ok: false,
        success: false,
        errorCode: errorCode,
        message: errorMsg || 'Procedure returned an error',
        data: { message: errorMsg || 'Procedure returned an error' }
      };
    }

    return {
      ok: true,
      success: true,
      errorCode: errorCode || 0,
      message: errorMsg || 'Department saved successfully',
      data: { message: errorMsg || 'Department saved successfully' }
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

module.exports = {
  getDepartmentListService,
  searchDepartmentListService,
  getDepartmentDetailsByIdService,
  saveDepartmentService,
};
