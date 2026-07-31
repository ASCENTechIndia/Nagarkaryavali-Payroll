const repo = require("./FrmHomepage.repo");

const getDepartmentWiseEmployee = async (ulbId) => {
  return await repo.getDepartmentWiseEmployeeRepo(ulbId);
};

const getGradeWiseEmployee = async (ulbId) => {
  return await repo.getGradeWiseEmployeeRepo(ulbId);
};

const getDepartmentWiseSalary = async (ulbId) => {
  return await repo.getDepartmentWiseSalaryRepo(ulbId);
};

async function getDesignationService(payload) {
  console.log("📥 Service: Get Designation List", payload);

  const data = await repo.getDesignation(payload);

  if (!data || data.length === 0) {
    return {
      success: false,
      message: "No data Found"
    }
  }

  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getDepartmentService(payload) {
    console.log("📥 Service: Get Department List", payload);

    const data = await repo.getDepartment(payload);

    if (!data || data.length === 0) {
        return {
            success: false,
            message: "No data found",
        };
    }

    return {
        success: true,
        count: data.length,
        data,
    };
}

async function getEmployeeService(payload) {
    console.log("📥 Service: Get Employee List", payload);

    const data = await repo.getEmployee(payload);

    if (!data || data.length === 0) {
        return {
            success: false,
            message: "No data found",
        };
    }

    return {
        success: true,
        count: data.length,
        data,
    };
}

module.exports = {
  getDepartmentWiseEmployee,
  getGradeWiseEmployee,
  getDepartmentWiseSalary,
  getDesignationService,
  getDepartmentService,
  getEmployeeService,
};