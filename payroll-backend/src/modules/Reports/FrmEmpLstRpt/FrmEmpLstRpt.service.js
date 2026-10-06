const repo = require("./FrmEmpLstRpt.repo");

async function getEmployeeListService({
  ulbid,
  empId,
  categoryId,
  deptId,
  desigId,
  gender,
  empStatus,
}) {
  if (!ulbid) {
    return {
      success: false,
      errorCode: 400,
      message: "ULB ID is required",
      data: [],
    };
  }

  if (!categoryId || categoryId === "0") {
    return {
      success: false,
      errorCode: 400,
      message: "Please select Category",
      data: [],
    };
  }

  if (!gender) {
    return {
      success: false,
      errorCode: 400,
      message: "Please select Gender",
      data: [],
    };
  }

  if (!empStatus) {
    return {
      success: false,
      errorCode: 400,
      message: "Please select Employee Status",
      data: [],
    };
  }

  try {
    const data = await repo.getEmployeeListRepo({
      ulbid,
      empId,
      categoryId,
      deptId,
      desigId,
      gender,
      empStatus,
    });

    if (!data || data.length === 0) {
      return {
        success: false,
        errorCode: 404,
        message: "Employee records not found",
        data: [],
      };
    }

    return {
      success: true,
      errorCode: 0,
      message: "Employee records fetched successfully",
      count: data.length,
      data,
    };
  } catch (error) {
    console.error("getEmployeeListService Error:", error);

    return {
      success: false,
      errorCode: error.errorCode || 500,
      message: error.message || "Failed to fetch employee list",
      data: [],
    };
  }
}

async function getSalaryDetailService({
  lstdate,
  ulbid,
  deptId,
  gender,
}) {
  if (!lstdate) {
    return {
      success: false,
      errorCode: 400,
      message: "Salary Date is required",
      data: [],
    };
  }

  if (!ulbid) {
    return {
      success: false,
      errorCode: 400,
      message: "ULB ID is required",
      data: [],
    };
  }

  if (!deptId) {
    return {
      success: false,
      errorCode: 400,
      message: "Department ID is required",
      data: [],
    };
  }

  try {
    const result = await repo.getSalaryDetailRepo({
      lstdate,
      ulbid,
      deptId,
      gender,
    });

    if (!result || !result.rows || result.rows.length === 0) {
      return {
        success: false,
        errorCode: 404,
        message: "Salary records not found",
        data: [],
      };
    }

    return {
      success: true,
      errorCode: 0,
      message: "Salary detail fetched successfully",
      count: result.rows.length,
      netEarning: result.netEarning,
      data: result.rows,
    };
  } catch (error) {
    console.error("getSalaryDetailService Error:", error);

    return {
      success: false,
      errorCode: error.errorCode || 500,
      message: error.message || "Failed to fetch salary detail",
      data: [],
    };
  }
}

async function getEmployeeSubDetailService({
  lstdate,
  ulbid,
  deptId,
  gender,
}) {
  if (!lstdate) {
    return {
      success: false,
      errorCode: 400,
      message: "Salary Date is required",
      data: [],
    };
  }

  if (!ulbid) {
    return {
      success: false,
      errorCode: 400,
      message: "ULB ID is required",
      data: [],
    };
  }

  if (!deptId) {
    return {
      success: false,
      errorCode: 400,
      message: "Department ID is required",
      data: [],
    };
  }

  try {
    const data = await repo.getEmployeeSubDetailRepo({
      lstdate,
      ulbid,
      deptId,
      gender,
    });

    if (!data || data.length === 0) {
      return {
        success: false,
        errorCode: 404,
        message: "Employee sub detail records not found",
        data: [],
      };
    }

    return {
      success: true,
      errorCode: 0,
      message: "Employee sub detail fetched successfully",
      count: data.length,
      data,
    };
  } catch (error) {
    console.error("getEmployeeSubDetailService Error:", error);

    return {
      success: false,
      errorCode: error.errorCode || 500,
      message: error.message || "Failed to fetch employee sub detail",
      data: [],
    };
  }
}

async function getPayheadSalaryDetailService({
  lstdate,
  ulbid,
  deptId,
  gender,
}) {
  if (!lstdate) {
    return {
      success: false,
      errorCode: 400,
      message: "Salary Date is required",
      data: [],
    };
  }

  if (!ulbid) {
    return {
      success: false,
      errorCode: 400,
      message: "ULB ID is required",
      data: [],
    };
  }

  if (!deptId) {
    return {
      success: false,
      errorCode: 400,
      message: "Department ID is required",
      data: [],
    };
  }

  if (String(deptId) === "406" && !gender) {
    return {
      success: false,
      errorCode: 400,
      message: "Gender is required",
      data: [],
    };
  }

  try {
    const data = await repo.getPayheadSalaryDetailRepo({
      lstdate,
      ulbid,
      deptId,
      gender,
    });

    if (!data || data.length === 0) {
      return {
        success: false,
        errorCode: 404,
        message: "Payhead salary records not found",
        data: [],
      };
    }

    return {
      success: true,
      errorCode: 0,
      message: "Payhead salary detail fetched successfully",
      count: data.length,
      data,
    };
  } catch (error) {
    console.error("getPayheadSalaryDetailService Error:", error);

    return {
      success: false,
      errorCode: error.errorCode || 500,
      message: error.message || "Failed to fetch payhead salary detail",
      data: [],
    };
  }
}

module.exports = {
  getEmployeeListService,
  getSalaryDetailService,
  getEmployeeSubDetailService,
  getPayheadSalaryDetailService,
};